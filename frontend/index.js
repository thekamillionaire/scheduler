import {
    initializeBlock,
    useBase,
    useRecords,
    useGlobalConfig,
    useLoadable,
    useWatchable,
    useSettingsButton,
    useRecordById,
    Box,
    colors,
    colorUtils,
    Heading,
    Icon,
    Input,
    ColorPaletteSynced,
    TablePickerSynced,
    ViewPickerSynced,
    FieldPickerSynced,
    expandRecord,
    expandRecordPickerAsync,
    FormField,
    Button,
    Text,
    ViewportConstraint
}
from '@airtable/blocks/ui';
import {settingsButton, cursor} from '@airtable/blocks';
import { FieldType, ViewType } from '@airtable/blocks/models';
import React, {useState}  from 'react';
// This custom block uses FullCalendar.io
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// This custom block also uses Moment.js
import moment from 'moment';

import loadCSS from './style';

function SchedulerBlock() {
    const base = useBase();
    const globalConfig = useGlobalConfig();
    
    const GlobalConfigKeys = {
        RESOURCES_TABLE_ID: "resourcesTableId",
        RESOURCES_VIEW_ID: "resourcesViewId",
        RESOURCES_RESERVATIONS_LINK_FIELD_ID: "resourcesReservationsLinkFieldId",
        RESERVATIONS_START_FIELD_ID: "reservationsStartFieldId",
        RESERVATIONS_END_FIELD_ID: "reservationsEndFieldId",
        RECORD_COLOR: "recordColor"
    };
    
    useLoadable(cursor);
    
    // Global Config Keys (Settings)
    const resourcesTableId = globalConfig.get(GlobalConfigKeys.RESOURCES_TABLE_ID)
    const resourcesViewId = globalConfig.get(GlobalConfigKeys.RESOURCES_VIEW_ID)
    const resourcesReservationsLinkFieldId = globalConfig.get(GlobalConfigKeys.RESOURCES_RESERVATIONS_LINK_FIELD_ID)
    const reservationsStartFieldId = globalConfig.get(GlobalConfigKeys.RESERVATIONS_START_FIELD_ID)
    const reservationsEndFieldId = globalConfig.get(GlobalConfigKeys.RESERVATIONS_END_FIELD_ID)
    const recordColor = globalConfig.get(GlobalConfigKeys.RECORD_COLOR)
    
    // Resources
    const resourcesTable = base.getTableByIdIfExists(resourcesTableId)
    const resourcesView = resourcesTable ? resourcesTable.getViewByIdIfExists(resourcesViewId) : null
    const resources = useRecords(resourcesView)
    const resourcesReservationsLinkField = resourcesTable ? resourcesTable.getFieldIfExists(resourcesReservationsLinkFieldId) : null
    // Reservations
    const reservationsTableId = resourcesReservationsLinkField && resourcesReservationsLinkField.type == "multipleRecordLinks" ? resourcesReservationsLinkField.options.linkedTableId : null
    const reservationsTable = base.getTableByIdIfExists(reservationsTableId)
    const reservations = useRecords(reservationsTable)
    const reservationsResourcesLinkFieldId = resourcesReservationsLinkField && resourcesReservationsLinkField.type == "multipleRecordLinks" ? resourcesReservationsLinkField.options.inverseLinkFieldId : null
    
    // This block is designed to work only if the start and end date fields are the same field type (either date or dateTime)
    const reservationsStartField = reservationsTable ? reservationsTable.getFieldIfExists(reservationsStartFieldId) : null
    const reservationsStartFieldMode = reservationsStartField ? reservationsStartField.type : null
    const reservationsEndField = reservationsTable ? reservationsTable.getFieldIfExists(reservationsEndFieldId) : null
    const reservationsEndFieldMode = reservationsEndField ? reservationsEndField.type : null
    const dateModesMatch = reservationsStartFieldMode === reservationsEndFieldMode ? true : false
    // The dateMode (either date or dateTime will determine if the displayed calendar will have timeslots, or if it will only allow all-day events)
    const dateMode = dateModesMatch ? reservationsStartFieldMode : null
    
    // Check if all settings options have values
    const initialSetupDone = resourcesTable && resourcesView && resourcesReservationsLinkField && reservationsTable && reservationsStartField && reservationsEndField && recordColor ? true : false;
    // Enable the settings button
    const [isShowingSettings, setIsShowingSettings] = useState(!initialSetupDone);
    useSettingsButton(function() {
        setIsShowingSettings(!isShowingSettings);
    });
    
    // Set the initial start and end dates to empty
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    
    // Allow users to select records from within the block
    const [addedResourcesIds, setAddedResourcesIds] = useState([])
    async function addToSelected() {
        const recordA = await expandRecordPickerAsync(resources ? resources.filter(record => !selectedResourcesIdsSet.has(record.id)) : resources)
        if(recordA) {
            let current = [...addedResourcesIds, ...cursorResourcesIdsSet]
            current.push(recordA.id)
            setAddedResourcesIds(new Set(current))
        }
    }
    
    // Get the record IDs of the currently selected records
    useWatchable(cursor, 'selectedRecordIds', () => {
        setStartTime('')
        setEndTime('')
        setAddedResourcesIds([])
    });
    
    // Get the currently selected record models from the Resources table
    let cursorResourcesIdsSet = new Set(cursor.selectedRecordIds)
    
    let selectedResourcesIdsSet = new Set([...addedResourcesIds].length ? [...addedResourcesIds] : [...cursorResourcesIdsSet])
    
    async function removeFromSelected() {
        const recordA = await expandRecordPickerAsync(resources ? resources.filter(record => selectedResourcesIdsSet.has(record.id)) : resources)
        if(recordA) {
            setAddedResourcesIds(new Set([...selectedResourcesIdsSet].filter(id => id != recordA.id)))
        }
    }
    
    const unselectedResourceCount = resources ? resources.length - [...selectedResourcesIdsSet].length : 0
    
    const selectedResources = resources ? resources.filter(record => selectedResourcesIdsSet.has(record.id)) : []
    // Get the selected resource records in a format to be passed into a multiple linked records field
    const selectedResourcesObjects = selectedResources.map(resource => ({id: resource.id}))
    // Count the number of currently selected records
    const selectedResourcesCount = selectedResources.length
    
    const headerValue = selectedResourcesCount > 0 
        ? "[" + selectedResourcesCount + "]: " + selectedResources.map(x => x.name).join(", ") 
        : "Click the + button or select records in the " + (resourcesView ? resourcesView.name : "appropriate") + " view"
    
    // Display the settings module if setup is required
    if (isShowingSettings || !dateModesMatch) {
        return (
            <React.Fragment>
                <BlockContainer>
                    <SettingsMenu
                        globalConfig={globalConfig}
                        GlobalConfigKeys={GlobalConfigKeys}
                        base={base}
                        initialSetupDone={initialSetupDone}
                        dateModesMatch={dateModesMatch}
                        onDoneClick={() => setIsShowingSettings(false)}
                    />
                </BlockContainer>
            </React.Fragment>
        )
    }
    
    // If the user is on the view chosen in the settings module, and if the user has selected at least one record, run the Scheduler
    else {
        return (
            <React.Fragment>
                <BlockContainer>
                    <Box display="flex" paddingBottom={3} borderBottom="thick" marginBottom={3} alignItems="flex-end">
                        <FormField label="Selected resource(s)" margin="0">
                            <Input
                                size="large"
                                value={headerValue}
                                disabled={true}
                                className="truncateText"
                                style={{opacity:0.75}}
                            />
                        </FormField>
                        <Button
                            onClick={addToSelected}
                            marginLeft={2}
                            icon="plus"
                            variant="primary"
                            aria-label="Add to selected resources"
                            disabled={unselectedResourceCount > 0 ? false: true}
                        />
                        <Button
                            onClick={removeFromSelected}
                            marginLeft={2}
                            icon="minus"
                            variant="danger"
                            aria-label="Remove from selected resources"
                            disabled={selectedResourcesCount > 0 ? false: true}
                        />
                    </Box>
                    <DateRangeSelector
                        selectedResources={selectedResources}
                        resourcesReservationsLinkFieldId={resourcesReservationsLinkFieldId}
                        reservationsTable={reservationsTable}
                        reservationsStartFieldId={reservationsStartFieldId}
                        reservationsEndFieldId={reservationsEndFieldId}
                        dateMode={dateMode}
                        setStartTime={setStartTime}
                        setEndTime={setEndTime}
                        startTime={startTime}
                        endTime={endTime}
                        recordColor={recordColor}
                    />
                    <ScheduleButton 
                        initialSetupDone={initialSetupDone}
                        table={reservationsTable}
                        linkField={reservationsResourcesLinkFieldId}
                        startField={reservationsStartFieldId}
                        endField={reservationsEndFieldId}
                        setStartTime={setStartTime}
                        setEndTime={setEndTime}
                        startTime={startTime}
                        endTime={endTime}
                        selectedResourcesObjects={selectedResourcesObjects}
                        selectedResourcesCount={selectedResourcesCount}
                    />
                </BlockContainer>
            </React.Fragment>
        )
    }
}

function DateRangeSelector(props) {
    // Create a record query of linked reservations for each selected resource
    const reservationsQueries = props.selectedResources.map(resource => resource.selectLinkedRecordsFromCell(props.resourcesReservationsLinkFieldId))

    useLoadable(reservationsQueries)
    useWatchable(reservationsQueries, ['records'])
    
    // Get the a single Set of all the linked reservations to remove duplicates
    const linkedReservations = new Set(reservationsQueries.map(query => query.records).flat())
    // Create an array of objects that FullCalendar can read and display
    const events = [...linkedReservations].map(reservation => {
        const startValue = reservation.getCellValue(props.reservationsStartFieldId)
        const endValue = reservation.getCellValue(props.reservationsEndFieldId)
        // FullCalendar.io displays all-day events differently from Airtable's calendar (spanning one extra day). For consistency, this code will address the discrepancy.
        const endValueDisplay = props.dateMode == "date" ? moment(endValue).add(1, "days").format("YYYY-MM-DD") : endValue
        
        return {
            id: reservation.id,
            title: reservation.name,
            start: startValue,
            end: endValueDisplay,
            overlap: false,
            backgroundColor: colorUtils.getHexForColor(props.recordColor),
            textColor: "#ffffff",
            borderColor: colorUtils.getHexForColor(colors.GRAY_LIGHT_2),
            record: reservation
        }
    })
    
    loadCSS();
    
    const views = props.dateMode == "date" ? "dayGridMonth,dayGridWeek" : "dayGridMonth,timeGridWeek"
    
    return (
        <Box className="calendar-container">
            <FullCalendar 
                defaultView="dayGridMonth" 
                header={{
                    left: "today prev,next title",
                    center: "",
                    right: views
                }}
                fixedweeks
                eventLimit="true"
                views={ 
                    {dayGridMonth:
                        {eventLimit: 3}
                    }
                }
                height="parent"
                plugins={[ dayGridPlugin, interactionPlugin, timeGridPlugin ]}
                selectable="true"
                // Select is put on a slight delay so that it follows Unselect, which is also on a slight delay
                select={(info) => {
                    props.setStartTime(info.startStr);
                    props.setEndTime(props.dateMode == "date" ? moment(info.endStr).subtract(1, "days").format("YYYY-MM-DD") : info.endStr)
                }}
                // Unselect is put on a slight delay so that if the "Schedule" button is clicked, the start and end times can still be captured
                unselect={() => {
                    props.setStartTime('');
                    props.setEndTime('')
                }}
                unselectCancel=".schedule-button"
                selectOverlap={function(event) {
                    return event.rendering === 'background';
                }}
                eventClick={(info) => {expandRecord(info.event.extendedProps.record)}}
                events={events}
            />
        </Box>
    )
}

function ScheduleButton(props) {
    async function CreateReservation() {
        const newRecordId = await props.table.createRecordAsync({
            [props.linkField]: props.selectedResourcesObjects,
            [props.startField]: props.startTime,
            [props.endField]: props.endTime
        });
        const query = await props.table.selectRecordsAsync()
        expandRecord(query.getRecordById(newRecordId))
        query.unloadData()
        props.setStartTime('');
        props.setEndTime('')
    }
    
    const checkPermissions = props.table ? props.table.checkPermissionsForCreateRecord() : {hasPermission: false}
    // Determines when if the button should be disabled (no dates have been selected or the user doesn't have permission to create a record in the Reservations table)
    const isDisabled = props.startTime =='' || checkPermissions.hasPermission == false || props.selectedResourcesCount == 0 ? true : false
    // Controls what the action at the bottom says
    const enabledText = props.selectedResourcesCount === 1 ? "Reserve this resource" : "Reserve these " + props.selectedResourcesCount + " resources"
    
    let disabledText
    
    if (!props.initialSetupDone) {
        disabledText = "Check block settings"
    } else if (checkPermissions.hasPermission == false) {
        disabledText = checkPermissions.reasonDisplayString
    } else if (props.selectedResourcesCount == 0) {
        disabledText = "No resources selected"
    } else {
        disabledText = "No dates selected"
    }
    
    const buttonText = isDisabled ? disabledText : enabledText
    
    return (
        <Button variant="primary" className="schedule-button" onClick={CreateReservation} icon="day" disabled={isDisabled} marginTop={3} alignSelf="center">{buttonText}</Button>
    )
}

function SettingsMenu(props) {
    const base = props.base
    
    const resourcesTableId = props.GlobalConfigKeys.RESOURCES_TABLE_ID
    const resourcesTable = base.getTableByIdIfExists(props.globalConfig.get(resourcesTableId))
    const resourcesViewId = props.GlobalConfigKeys.RESOURCES_VIEW_ID
    const resourcesReservationsLinkFieldId = props.GlobalConfigKeys.RESOURCES_RESERVATIONS_LINK_FIELD_ID
    const resourcesReservationsLinkField = resourcesTable ? resourcesTable.getFieldByIdIfExists(props.globalConfig.get(resourcesReservationsLinkFieldId)) : null
    
    const reservationsTableId = resourcesReservationsLinkField && resourcesReservationsLinkField.type == "multipleRecordLinks" ? resourcesReservationsLinkField.options.linkedTableId : null
    const reservationsTable = base.getTableByIdIfExists(reservationsTableId)
    const reservationsStartFieldId = props.GlobalConfigKeys.RESERVATIONS_START_FIELD_ID
    const reservationsEndFieldId = props.GlobalConfigKeys.RESERVATIONS_END_FIELD_ID
    const recordColor = props.GlobalConfigKeys.RECORD_COLOR
    
    const allowedColors = [
        colors.BLUE,
        colors.CYAN,
        colors.TEAL,
        colors.GREEN,
        colors.YELLOW,
        colors.ORANGE,
        colors.RED,
        colors.PINK,
        colors.PURPLE,
        colors.GRAY,
    ];
    
    !props.globalConfig.get(recordColor) && props.globalConfig.setAsync(recordColor, allowedColors[0])
    
    
    const resetResourceFields = () => {
        const paths = [
            {path: [resourcesReservationsLinkFieldId], value: null},
            {path: [resourcesViewId], value: null}
        ]
        props.globalConfig.setPathsAsync(paths);
    }
    const resetReservationsFields = () => {
        const paths = [
            {path: [reservationsStartFieldId], value: null},
            {path: [reservationsEndFieldId], value: null}
        ]
        props.globalConfig.setPathsAsync(paths);
    }
    const reservationsTableName = reservationsTable ? reservationsTable.name : "associated with the Link field"
    const tableText = "This block will use the table " + reservationsTableName + " for reservation details"
    
    return(
        <React.Fragment>
            <Heading marginBottom={3}>Scheduler settings</Heading>
            <Box alignSelf="stretch">
                <Box margin={-2}  display="flex" flexDirection="row" flexWrap="wrap">
                    <Box border="thick" borderRadius="large" flex="1 1 200px" margin={2} padding={3}>
                        <Heading size="small">Resources</Heading>
                        <FormField label="Table" description="The table for the records being reserved" marginY={2}>
                            <TablePickerSynced 
                                globalConfigKey={resourcesTableId}
                                onChange={resetResourceFields}
                            />
                        </FormField>
                        {resourcesTable && (<React.Fragment>
                            <FormField label="View" description="Record selections must be made from this grid view" marginY={2}>
                                <ViewPickerSynced 
                                    globalConfigKey={resourcesViewId} 
                                    table={resourcesTable}
                                    allowedTypes={[ViewType.GRID]}
                                />
                            </FormField>
                            <FormField label="Link field" description="The linked record field which connects to the Reservations table" marginY={2}>
                                <FieldPickerSynced
                                    table={resourcesTable}
                                    globalConfigKey={resourcesReservationsLinkFieldId}
                                    allowedTypes={[
                                        FieldType.MULTIPLE_RECORD_LINKS
                                    ]}
                                />
                            </FormField>
                        </React.Fragment>)}
                        
                    </Box>
                    <Box border="thick" borderRadius="large" flex="1 1 200px" margin={2} padding={3}>
                        <Heading size="small">Reservations</Heading>
                        {reservationsTable && (<React.Fragment>
                            <FormField label="Table" description={tableText} marginY={2}>
                            </FormField>
                            <FormField label="Start field" marginY={2}>
                                <FieldPickerSynced
                                    table={reservationsTable}
                                    globalConfigKey={reservationsStartFieldId}
                                    allowedTypes={[
                                        FieldType.DATE,
                                        FieldType.DATE_TIME
                                    ]}
                                />
                            </FormField>
                            <FormField label="End field" marginY={2}>
                                <FieldPickerSynced
                                    table={reservationsTable}
                                    globalConfigKey={reservationsEndFieldId}
                                    allowedTypes={[
                                        FieldType.DATE,
                                        FieldType.DATE_TIME
                                    ]}
                                />
                            </FormField>
                            {!props.dateModesMatch &&
                                <Box display="flex" alignItems="center" marginY={2}>                    
                                    <Icon name="warning" flex="1 1 30px" fillColor="orange" marginRight={2} />
                                    <Text>The start and end date fields should be of the same type (either dates or dateTimes)</Text>
                                </Box>
                            }
                            <FormField label="Record color" marginY={2}>
                                <ColorPaletteSynced globalConfigKey={recordColor} allowedColors={allowedColors} />
                            </FormField>
                        </React.Fragment>)}
                    </Box>
                </Box>
            </Box>
            <Box display="flex" marginTop={3} alignSelf="flex-end">
                <Button
                    variant="primary"
                    size="large"
                    icon="check"
                    disabled={!props.initialSetupDone || !props.dateModesMatch}
                    onClick={props.onDoneClick}
                >
                    Done
                </Button>
            </Box>
        </React.Fragment>
    )
}
    
function BlockContainer({children}) {
    return (
        <div id="Scheduler-Block" width="100%" height="100vh">
            <ViewportConstraint minSize={{width: 400, height: 400}}>
                <Box padding={3} display="flex" flexDirection="column" width="100%" height="100vh">
                    {children}
                </Box>
            </ViewportConstraint>
        </div>
    )
}

initializeBlock(() => <SchedulerBlock />);
