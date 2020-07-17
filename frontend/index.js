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
    ColorPaletteSynced,
    TablePickerSynced,
    ViewPickerSynced,
    FieldPickerSynced,
    expandRecord,
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
        ASSETS_TABLE_ID: "assetsTableId",
        ASSETS_VIEW_ID: "assetsViewId",
        ASSETS_RESERVATIONS_LINK_FIELD_ID: "assetsReservationsLinkFieldId",
        RESERVATIONS_TABLE_ID: "reservationsTableId",
        RESERVATIONS_START_FIELD_ID: "reservationsStartFieldId",
        RESERVATIONS_END_FIELD_ID: "reservationsEndFieldId",
        RECORD_COLOR: "recordColor"
    };
    
    useLoadable(cursor);
    useWatchable(cursor, ['activeViewId']);
    
    // Global Config Keys (Settings)
    const assetsTableId = globalConfig.get(GlobalConfigKeys.ASSETS_TABLE_ID)
    const assetsViewId = globalConfig.get(GlobalConfigKeys.ASSETS_VIEW_ID)
    const assetsReservationsLinkFieldId = globalConfig.get(GlobalConfigKeys.ASSETS_RESERVATIONS_LINK_FIELD_ID)
    const reservationsTableId = globalConfig.get(GlobalConfigKeys.RESERVATIONS_TABLE_ID)
    const reservationsStartFieldId = globalConfig.get(GlobalConfigKeys.RESERVATIONS_START_FIELD_ID)
    const reservationsEndFieldId = globalConfig.get(GlobalConfigKeys.RESERVATIONS_END_FIELD_ID)
    const recordColor = globalConfig.get(GlobalConfigKeys.RECORD_COLOR)
    // Check if all settings options have values
    const initialSetupDone = assetsTableId && assetsViewId && assetsReservationsLinkFieldId && reservationsTableId && reservationsStartFieldId && reservationsEndFieldId && recordColor ? true : false;
    
    // Enable the settings button
    const [isShowingSettings, setIsShowingSettings] = useState(!initialSetupDone);
    useSettingsButton(function() {
        initialSetupDone && setIsShowingSettings(!isShowingSettings);
    });
    
    // Assets
    const assetsTable = base.getTableByIdIfExists(assetsTableId)
    const assetsView = assetsTable ? assetsTable.getViewByIdIfExists(assetsViewId) : null
    const assets = useRecords(assetsView)
    const assetsReservationsLinkField = assetsTable ? assetsTable.getFieldIfExists(assetsReservationsLinkFieldId) : null
    // Reservations
    const reservationsTable = base.getTableByIdIfExists(reservationsTableId)
    const reservations = useRecords(reservationsTable)
    const reservationsAssetsLinkFieldId = assetsReservationsLinkField ? assetsReservationsLinkField.options.inverseLinkFieldId : null
    
    // This block is designed to work only if the start and end date fields are the same field type (either date or dateTime)
    const reservationsStartField = reservationsTable ? reservationsTable.getFieldIfExists(reservationsStartFieldId) : null
    const reservationsStartFieldMode = reservationsStartField ? reservationsStartField.type : null
    const reservationsEndField = reservationsTable ? reservationsTable.getFieldIfExists(reservationsEndFieldId) : null
    const reservationsEndFieldMode = reservationsEndField ? reservationsEndField.type : null
    const dateModesMatch = reservationsStartFieldMode === reservationsEndFieldMode ? true : false
    // The dateMode (either date or dateTime will determine if the displayed calendar will have timeslots, or if it will only allow all-day events)
    const dateMode = dateModesMatch ? reservationsStartFieldMode : null
    
    // Set the initial start and end dates to empty
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    // Get the record IDs of the currently selected records
    useWatchable(cursor, 'selectedRecordIds', () => {
        setStartTime('')
        setEndTime('')
    });
    // Get the currently selected record models from the Assets table
    const selectedAssetsIdsSet = new Set(cursor.selectedRecordIds)
    const selectedAssets = assets ? assets.filter(record => selectedAssetsIdsSet.has(record.id)) : []
    // Get the selected asset records in a format to be passed into a multiple record links field
    const selectedAssetsObjects = selectedAssets.map(asset => ({id: asset.id}))
    // Count the number of currently selected records
    const selectedAssetsCount = selectedAssets.length
    
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
    else if (cursor.activeViewId == assetsViewId && cursor.selectedRecordIds.length > 0) {
        return (
            <React.Fragment>
                <BlockContainer>
                    <DateRangeSelector
                        selectedAssets={selectedAssets}
                        assetsReservationsLinkFieldId={assetsReservationsLinkFieldId}
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
                        table={reservationsTable}
                        linkField={reservationsAssetsLinkFieldId}
                        startField={reservationsStartFieldId}
                        endField={reservationsEndFieldId}
                        setStartTime={setStartTime}
                        setEndTime={setEndTime}
                        startTime={startTime}
                        endTime={endTime}
                        selectedAssetsObjects={selectedAssetsObjects}
                        selectedAssetsCount={selectedAssetsCount}
                    />
                </BlockContainer>
            </React.Fragment>
        )
    }
    
    // Remind the user to select at least one record from the appropriate table and view
    else {
        return (
            <React.Fragment>
                <BlockContainer>
                    <Box padding={3} backgroundColor="lightGray1" border="thick" borderRadius="large" maxWidth="500px">
                        <Box display="flex" alignItems="center" marginBottom={3}>                    
                            <Icon name="warning" fillColor="orange" marginRight={3} />
                            <Heading margin={0} flex="1 1" variant="caps">No records selected</Heading>
                        </Box>
                        <Text size="large" textColor="light">Select at least one record from the <span style={{fontWeight: 600}}>{assetsTable.name}</span> table in the <span style={{fontWeight: 600}}>{assetsView.name}</span> view. The existing schedule for the selected record(s) will determine the dates available to schedule a new reservation in the <span style={{fontWeight: 600}}>{reservationsTable.name}</span> table.</Text>
                    </Box>
                </BlockContainer>
            </React.Fragment>
        )
    }
}

function DateRangeSelector(props) {
    // Create a record query of linked reservations for each selected asset
    const reservationsQueries = props.selectedAssets.map(asset => asset.selectLinkedRecordsFromCell(props.assetsReservationsLinkFieldId))

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
            [props.linkField]: props.selectedAssetsObjects,
            [props.startField]: props.startTime,
            [props.endField]: props.endTime
        });
        const query = await props.table.selectRecordsAsync()
        expandRecord(query.getRecordById(newRecordId))
        query.unloadData()
        props.setStartTime('');
        props.setEndTime('')
    }
    
    const checkPermissions = props.table.checkPermissionsForCreateRecord()
    // Determines when if the button should be disabled (no dates have been selected or the user doesn't have permission to create a record in the Reservations table)
    const isDisabled = props.startTime =='' || checkPermissions.hasPermission == false ? true : false
    // Controls what the action at the bottom says
    const enabledText = props.selectedAssetsCount === 1 ? "Schedule this record" : "Schedule these " + props.selectedAssetsCount + " records"
    const disabledText = checkPermissions.hasPermission == false ? checkPermissions.reasonDisplayString : "No dates selected"
    
    const buttonText = isDisabled ? disabledText : enabledText
    
    return (
        <Button variant="primary" className="schedule-button" onClick={CreateReservation} icon="day" disabled={isDisabled} marginTop={3}>{buttonText}</Button>
    )
}

function SettingsMenu(props) {
    const base = props.base
    
    const assetsTableId = props.GlobalConfigKeys.ASSETS_TABLE_ID
    const assetsTable = base.getTableByIdIfExists(props.globalConfig.get(assetsTableId))
    const assetsReservationsLinkFieldId = props.GlobalConfigKeys.ASSETS_RESERVATIONS_LINK_FIELD_ID
    const assetsViewId = props.GlobalConfigKeys.ASSETS_VIEW_ID
    
    const reservationsTableId = props.GlobalConfigKeys.RESERVATIONS_TABLE_ID
    const reservationsTable = base.getTableByIdIfExists(props.globalConfig.get(reservationsTableId))
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
    
    
    const resetAssetFields = () => {
        const paths = [
            {path: [assetsReservationsLinkFieldId], value: null},
            {path: [assetsViewId], value: null}
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
    
    return(
        <React.Fragment>
            <Heading marginBottom={4}>Scheduler settings</Heading>
            <Box alignSelf="stretch">
                <Box margin={-2}  display="flex" flexDirection="row" flexWrap="wrap">
                    <Box border="thick" borderRadius="large" flex="1 1" margin={2} padding={3}>
                        <Heading size="small">Assets</Heading>
                        <FormField label="Table" description="The table for the records being reserved" marginY={2}>
                            <TablePickerSynced 
                                globalConfigKey={assetsTableId}
                                onChange={resetAssetFields}
                            />
                        </FormField>
                        <FormField label="View" description="Record selections must be made from this grid view" marginY={2}>
                            <ViewPickerSynced 
                                globalConfigKey={assetsViewId} 
                                table={assetsTable}
                                allowedTypes={[ViewType.GRID]}
                            />
                        </FormField>
                        <FormField label="Link field" description="The record link field which connects to the Reservations/Appointments table" marginY={2}>
                            <FieldPickerSynced
                                table={assetsTable}
                                globalConfigKey={assetsReservationsLinkFieldId}
                                allowedTypes={[
                                    FieldType.MULTIPLE_RECORD_LINKS
                                ]}
                            />
                        </FormField>
                    </Box>
                    <Box border="thick" borderRadius="large" flex="1 1" margin={2} padding={3}>
                        <Heading size="small">Schedule</Heading>
                        <FormField label="Table" description="The table for the appointment/reservation details" marginY={2}>
                            <TablePickerSynced
                                globalConfigKey={reservationsTableId}
                                onChange={resetReservationsFields} 
                            />
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
                    </Box>
                </Box>
            </Box>
            <Box display="flex" marginTop={4}>
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
            <ViewportConstraint minSize={{width: 600, height: 600}}>
                <Box padding={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="100%" height="100%">
                    {children}
                </Box>
            </ViewportConstraint>
        </div>
    )
}

initializeBlock(() => <SchedulerBlock />);
