"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _ui = require("@airtable/blocks/ui");

var _blocks = require("@airtable/blocks");

var _models = require("@airtable/blocks/models");

var _react = _interopRequireWildcard(require("react"));

var _react2 = _interopRequireDefault(require("@fullcalendar/react"));

var _daygrid = _interopRequireDefault(require("@fullcalendar/daygrid"));

var _timegrid = _interopRequireDefault(require("@fullcalendar/timegrid"));

var _interaction = _interopRequireDefault(require("@fullcalendar/interaction"));

var _moment = _interopRequireDefault(require("moment"));

var _style = _interopRequireDefault(require("./style"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function SchedulerBlock() {
  var base = (0, _ui.useBase)();
  var globalConfig = (0, _ui.useGlobalConfig)();
  var GlobalConfigKeys = {
    ASSETS_TABLE_ID: "assetsTableId",
    ASSETS_VIEW_ID: "assetsViewId",
    ASSETS_RESERVATIONS_LINK_FIELD_ID: "assetsReservationsLinkFieldId",
    RESERVATIONS_TABLE_ID: "reservationsTableId",
    RESERVATIONS_START_FIELD_ID: "reservationsStartFieldId",
    RESERVATIONS_END_FIELD_ID: "reservationsEndFieldId",
    RECORD_COLOR: "recordColor"
  };
  (0, _ui.useLoadable)(_blocks.cursor);
  (0, _ui.useWatchable)(_blocks.cursor, ['activeViewId']); // Global Config Keys (Settings)

  var assetsTableId = globalConfig.get(GlobalConfigKeys.ASSETS_TABLE_ID);
  var assetsViewId = globalConfig.get(GlobalConfigKeys.ASSETS_VIEW_ID);
  var assetsReservationsLinkFieldId = globalConfig.get(GlobalConfigKeys.ASSETS_RESERVATIONS_LINK_FIELD_ID);
  var reservationsTableId = globalConfig.get(GlobalConfigKeys.RESERVATIONS_TABLE_ID);
  var reservationsStartFieldId = globalConfig.get(GlobalConfigKeys.RESERVATIONS_START_FIELD_ID);
  var reservationsEndFieldId = globalConfig.get(GlobalConfigKeys.RESERVATIONS_END_FIELD_ID);
  var recordColor = globalConfig.get(GlobalConfigKeys.RECORD_COLOR); // Check if all settings options have values

  var initialSetupDone = assetsTableId && assetsViewId && assetsReservationsLinkFieldId && reservationsTableId && reservationsStartFieldId && reservationsEndFieldId && recordColor ? true : false; // Enable the settings button

  var _useState = (0, _react.useState)(!initialSetupDone),
      _useState2 = _slicedToArray(_useState, 2),
      isShowingSettings = _useState2[0],
      setIsShowingSettings = _useState2[1];

  (0, _ui.useSettingsButton)(function () {
    initialSetupDone && setIsShowingSettings(!isShowingSettings);
  }); // Assets

  var assetsTable = base.getTableByIdIfExists(assetsTableId);
  var assetsView = assetsTable ? assetsTable.getViewByIdIfExists(assetsViewId) : null;
  var assets = (0, _ui.useRecords)(assetsView);
  var assetsReservationsLinkField = assetsTable ? assetsTable.getFieldIfExists(assetsReservationsLinkFieldId) : null; // Reservations

  var reservationsTable = base.getTableByIdIfExists(reservationsTableId);
  var reservations = (0, _ui.useRecords)(reservationsTable);
  var reservationsAssetsLinkFieldId = assetsReservationsLinkField ? assetsReservationsLinkField.options.inverseLinkFieldId : null; // This block is designed to work only if the start and end date fields are the same field type (either date or dateTime)

  var reservationsStartField = reservationsTable ? reservationsTable.getFieldIfExists(reservationsStartFieldId) : null;
  var reservationsStartFieldMode = reservationsStartField ? reservationsStartField.type : null;
  var reservationsEndField = reservationsTable ? reservationsTable.getFieldIfExists(reservationsEndFieldId) : null;
  var reservationsEndFieldMode = reservationsEndField ? reservationsEndField.type : null;
  var dateModesMatch = reservationsStartFieldMode === reservationsEndFieldMode ? true : false; // The dateMode (either date or dateTime will determine if the displayed calendar will have timeslots, or if it will only allow all-day events)

  var dateMode = dateModesMatch ? reservationsStartFieldMode : null; // Set the initial start and end dates to empty

  var _useState3 = (0, _react.useState)(''),
      _useState4 = _slicedToArray(_useState3, 2),
      startTime = _useState4[0],
      setStartTime = _useState4[1];

  var _useState5 = (0, _react.useState)(''),
      _useState6 = _slicedToArray(_useState5, 2),
      endTime = _useState6[0],
      setEndTime = _useState6[1]; // Get the record IDs of the currently selected records


  (0, _ui.useWatchable)(_blocks.cursor, 'selectedRecordIds', function () {
    setStartTime('');
    setEndTime('');
  }); // Get the currently selected record models from the Assets table

  var selectedAssetsIdsSet = new Set(_blocks.cursor.selectedRecordIds);
  var selectedAssets = assets ? assets.filter(function (record) {
    return selectedAssetsIdsSet.has(record.id);
  }) : []; // Get the selected asset records in a format to be passed into a multiple record links field

  var selectedAssetsObjects = selectedAssets.map(function (asset) {
    return {
      id: asset.id
    };
  }); // Count the number of currently selected records

  var selectedAssetsCount = selectedAssets.length; // Display the settings module if setup is required

  if (isShowingSettings || !dateModesMatch) {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(BlockContainer, null, /*#__PURE__*/_react.default.createElement(SettingsMenu, {
      globalConfig: globalConfig,
      GlobalConfigKeys: GlobalConfigKeys,
      base: base,
      initialSetupDone: initialSetupDone,
      dateModesMatch: dateModesMatch,
      onDoneClick: function onDoneClick() {
        return setIsShowingSettings(false);
      }
    })));
  } // If the user is on the view chosen in the settings module, and if the user has selected at least one record, run the Scheduler
  else if (_blocks.cursor.activeViewId == assetsViewId && _blocks.cursor.selectedRecordIds.length > 0) {
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(BlockContainer, null, /*#__PURE__*/_react.default.createElement(DateRangeSelector, {
        selectedAssets: selectedAssets,
        assetsReservationsLinkFieldId: assetsReservationsLinkFieldId,
        reservationsTable: reservationsTable,
        reservationsStartFieldId: reservationsStartFieldId,
        reservationsEndFieldId: reservationsEndFieldId,
        dateMode: dateMode,
        setStartTime: setStartTime,
        setEndTime: setEndTime,
        startTime: startTime,
        endTime: endTime,
        recordColor: recordColor
      }), /*#__PURE__*/_react.default.createElement(ScheduleButton, {
        table: reservationsTable,
        linkField: reservationsAssetsLinkFieldId,
        startField: reservationsStartFieldId,
        endField: reservationsEndFieldId,
        setStartTime: setStartTime,
        setEndTime: setEndTime,
        startTime: startTime,
        endTime: endTime,
        selectedAssetsObjects: selectedAssetsObjects,
        selectedAssetsCount: selectedAssetsCount
      })));
    } // Remind the user to select at least one record from the appropriate table and view
    else {
        return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(BlockContainer, null, /*#__PURE__*/_react.default.createElement(_ui.Box, {
          padding: 3,
          backgroundColor: "lightGray1",
          border: "thick",
          borderRadius: "large",
          maxWidth: "500px"
        }, /*#__PURE__*/_react.default.createElement(_ui.Box, {
          display: "flex",
          alignItems: "center",
          marginBottom: 3
        }, /*#__PURE__*/_react.default.createElement(_ui.Icon, {
          name: "warning",
          fillColor: "orange",
          marginRight: 3
        }), /*#__PURE__*/_react.default.createElement(_ui.Heading, {
          margin: 0,
          flex: "1 1",
          variant: "caps"
        }, "No records selected")), /*#__PURE__*/_react.default.createElement(_ui.Text, {
          size: "large",
          textColor: "light"
        }, "Select at least one record from the ", /*#__PURE__*/_react.default.createElement("span", {
          style: {
            fontWeight: 600
          }
        }, assetsTable.name), " table in the ", /*#__PURE__*/_react.default.createElement("span", {
          style: {
            fontWeight: 600
          }
        }, assetsView.name), " view. The existing schedule for the selected record(s) will determine the dates available to schedule a new reservation in the ", /*#__PURE__*/_react.default.createElement("span", {
          style: {
            fontWeight: 600
          }
        }, reservationsTable.name), " table."))));
      }
}

function DateRangeSelector(props) {
  // Create a record query of linked reservations for each selected asset
  var reservationsQueries = props.selectedAssets.map(function (asset) {
    return asset.selectLinkedRecordsFromCell(props.assetsReservationsLinkFieldId);
  });
  (0, _ui.useLoadable)(reservationsQueries);
  (0, _ui.useWatchable)(reservationsQueries, ['records']); // Get the a single Set of all the linked reservations to remove duplicates

  var linkedReservations = new Set(reservationsQueries.map(function (query) {
    return query.records;
  }).flat()); // Create an array of objects that FullCalendar can read and display

  var events = _toConsumableArray(linkedReservations).map(function (reservation) {
    var startValue = reservation.getCellValue(props.reservationsStartFieldId);
    var endValue = reservation.getCellValue(props.reservationsEndFieldId); // FullCalendar.io displays all-day events differently from Airtable's calendar (spanning one extra day). For consistency, this code will address the discrepancy.

    var endValueDisplay = props.dateMode == "date" ? (0, _moment.default)(endValue).add(1, "days").format("YYYY-MM-DD") : endValue;
    return {
      id: reservation.id,
      title: reservation.name,
      start: startValue,
      end: endValueDisplay,
      overlap: false,
      backgroundColor: _ui.colorUtils.getHexForColor(props.recordColor),
      textColor: "#ffffff",
      borderColor: _ui.colorUtils.getHexForColor(_ui.colors.GRAY_LIGHT_2),
      record: reservation
    };
  });

  (0, _style.default)();
  var views = props.dateMode == "date" ? "dayGridMonth,dayGridWeek" : "dayGridMonth,timeGridWeek";
  return /*#__PURE__*/_react.default.createElement(_ui.Box, {
    className: "calendar-container"
  }, /*#__PURE__*/_react.default.createElement(_react2.default, {
    defaultView: "dayGridMonth",
    header: {
      left: "today prev,next title",
      center: "",
      right: views
    },
    fixedweeks: true,
    eventLimit: "true",
    views: {
      dayGridMonth: {
        eventLimit: 3
      }
    },
    height: "parent",
    plugins: [_daygrid.default, _interaction.default, _timegrid.default],
    selectable: "true" // Select is put on a slight delay so that it follows Unselect, which is also on a slight delay
    ,
    select: function select(info) {
      props.setStartTime(info.startStr);
      props.setEndTime(props.dateMode == "date" ? (0, _moment.default)(info.endStr).subtract(1, "days").format("YYYY-MM-DD") : info.endStr);
    } // Unselect is put on a slight delay so that if the "Schedule" button is clicked, the start and end times can still be captured
    ,
    unselect: function unselect() {
      props.setStartTime('');
      props.setEndTime('');
    },
    unselectCancel: ".schedule-button",
    selectOverlap: function selectOverlap(event) {
      return event.rendering === 'background';
    },
    eventClick: function eventClick(info) {
      (0, _ui.expandRecord)(info.event.extendedProps.record);
    },
    events: events
  }));
}

function ScheduleButton(props) {
  function CreateReservation() {
    return _CreateReservation.apply(this, arguments);
  }

  function _CreateReservation() {
    _CreateReservation = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var _props$table$createRe;

      var newRecordId, query;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return props.table.createRecordAsync((_props$table$createRe = {}, _defineProperty(_props$table$createRe, props.linkField, props.selectedAssetsObjects), _defineProperty(_props$table$createRe, props.startField, props.startTime), _defineProperty(_props$table$createRe, props.endField, props.endTime), _props$table$createRe));

            case 2:
              newRecordId = _context.sent;
              _context.next = 5;
              return props.table.selectRecordsAsync();

            case 5:
              query = _context.sent;
              (0, _ui.expandRecord)(query.getRecordById(newRecordId));
              query.unloadData();
              props.setStartTime('');
              props.setEndTime('');

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _CreateReservation.apply(this, arguments);
  }

  var checkPermissions = props.table.checkPermissionsForCreateRecord(); // Determines when if the button should be disabled (no dates have been selected or the user doesn't have permission to create a record in the Reservations table)

  var isDisabled = props.startTime == '' || checkPermissions.hasPermission == false ? true : false; // Controls what the action at the bottom says

  var enabledText = props.selectedAssetsCount === 1 ? "Schedule this record" : "Schedule these " + props.selectedAssetsCount + " records";
  var disabledText = checkPermissions.hasPermission == false ? checkPermissions.reasonDisplayString : "No dates selected";
  var buttonText = isDisabled ? disabledText : enabledText;
  return /*#__PURE__*/_react.default.createElement(_ui.Button, {
    variant: "primary",
    className: "schedule-button",
    onClick: CreateReservation,
    icon: "day",
    disabled: isDisabled,
    marginTop: 3
  }, buttonText);
}

function SettingsMenu(props) {
  var _React$createElement;

  var base = props.base;
  var assetsTableId = props.GlobalConfigKeys.ASSETS_TABLE_ID;
  var assetsTable = base.getTableByIdIfExists(props.globalConfig.get(assetsTableId));
  var assetsReservationsLinkFieldId = props.GlobalConfigKeys.ASSETS_RESERVATIONS_LINK_FIELD_ID;
  var assetsViewId = props.GlobalConfigKeys.ASSETS_VIEW_ID;
  var reservationsTableId = props.GlobalConfigKeys.RESERVATIONS_TABLE_ID;
  var reservationsTable = base.getTableByIdIfExists(props.globalConfig.get(reservationsTableId));
  var reservationsStartFieldId = props.GlobalConfigKeys.RESERVATIONS_START_FIELD_ID;
  var reservationsEndFieldId = props.GlobalConfigKeys.RESERVATIONS_END_FIELD_ID;
  var recordColor = props.GlobalConfigKeys.RECORD_COLOR;
  var allowedColors = [_ui.colors.BLUE, _ui.colors.CYAN, _ui.colors.TEAL, _ui.colors.GREEN, _ui.colors.YELLOW, _ui.colors.ORANGE, _ui.colors.RED, _ui.colors.PINK, _ui.colors.PURPLE, _ui.colors.GRAY];

  var resetAssetFields = function resetAssetFields() {
    var paths = [{
      path: [assetsReservationsLinkFieldId],
      value: null
    }, {
      path: [assetsViewId],
      value: null
    }];
    props.globalConfig.setPathsAsync(paths);
  };

  var resetReservationsFields = function resetReservationsFields() {
    var paths = [{
      path: [reservationsStartFieldId],
      value: null
    }, {
      path: [reservationsEndFieldId],
      value: null
    }];
    props.globalConfig.setPathsAsync(paths);
  };

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ui.Heading, {
    marginBottom: 4
  }, "Scheduler settings"), /*#__PURE__*/_react.default.createElement(_ui.Box, {
    alignSelf: "stretch"
  }, /*#__PURE__*/_react.default.createElement(_ui.Box, {
    margin: -2,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap"
  }, /*#__PURE__*/_react.default.createElement(_ui.Box, {
    border: "thick",
    borderRadius: "large",
    flex: "1 1",
    margin: 2,
    padding: 3
  }, /*#__PURE__*/_react.default.createElement(_ui.Heading, {
    size: "small"
  }, "Assets"), /*#__PURE__*/_react.default.createElement(_ui.FormField, {
    label: "Table",
    description: "The table for the records being reserved",
    marginY: 2
  }, /*#__PURE__*/_react.default.createElement(_ui.TablePickerSynced, (_React$createElement = {
    globalConfigKey: assetsTableId
  }, _defineProperty(_React$createElement, "globalConfigKey", assetsTableId), _defineProperty(_React$createElement, "onChange", resetAssetFields), _React$createElement))), /*#__PURE__*/_react.default.createElement(_ui.FormField, {
    label: "View",
    description: "Record selections must be made from this grid view",
    marginY: 2
  }, /*#__PURE__*/_react.default.createElement(_ui.ViewPickerSynced, {
    globalConfigKey: assetsViewId,
    table: assetsTable,
    allowedTypes: [_models.ViewType.GRID]
  })), /*#__PURE__*/_react.default.createElement(_ui.FormField, {
    label: "Link field",
    description: "The record link field which connects to the Reservations/Appointments table",
    marginY: 2
  }, /*#__PURE__*/_react.default.createElement(_ui.FieldPickerSynced, {
    table: assetsTable,
    globalConfigKey: assetsReservationsLinkFieldId,
    allowedTypes: [_models.FieldType.MULTIPLE_RECORD_LINKS]
  }))), /*#__PURE__*/_react.default.createElement(_ui.Box, {
    border: "thick",
    borderRadius: "large",
    flex: "1 1",
    margin: 2,
    padding: 3
  }, /*#__PURE__*/_react.default.createElement(_ui.Heading, {
    size: "small"
  }, "Schedule"), /*#__PURE__*/_react.default.createElement(_ui.FormField, {
    label: "Table",
    description: "The table for the appointment/reservation details",
    marginY: 2
  }, /*#__PURE__*/_react.default.createElement(_ui.TablePickerSynced, {
    globalConfigKey: reservationsTableId,
    onChange: resetReservationsFields
  })), /*#__PURE__*/_react.default.createElement(_ui.FormField, {
    label: "Start field",
    marginY: 2
  }, /*#__PURE__*/_react.default.createElement(_ui.FieldPickerSynced, {
    table: reservationsTable,
    globalConfigKey: reservationsStartFieldId,
    allowedTypes: [_models.FieldType.DATE, _models.FieldType.DATE_TIME]
  })), /*#__PURE__*/_react.default.createElement(_ui.FormField, {
    label: "End field",
    marginY: 2
  }, /*#__PURE__*/_react.default.createElement(_ui.FieldPickerSynced, {
    table: reservationsTable,
    globalConfigKey: reservationsEndFieldId,
    allowedTypes: [_models.FieldType.DATE, _models.FieldType.DATE_TIME]
  })), !props.dateModesMatch && /*#__PURE__*/_react.default.createElement(_ui.Box, {
    display: "flex",
    alignItems: "center",
    marginY: 2
  }, /*#__PURE__*/_react.default.createElement(_ui.Icon, {
    name: "warning",
    flex: "1 1 30px",
    fillColor: "orange",
    marginRight: 2
  }), /*#__PURE__*/_react.default.createElement(_ui.Text, null, "The start and end date fields should be of the same type (either dates or dateTimes)")), /*#__PURE__*/_react.default.createElement(_ui.FormField, {
    label: "Record color",
    marginY: 2
  }, /*#__PURE__*/_react.default.createElement(_ui.ColorPaletteSynced, {
    globalConfigKey: recordColor,
    allowedColors: allowedColors
  }))))), /*#__PURE__*/_react.default.createElement(_ui.Box, {
    display: "flex",
    marginTop: 4
  }, /*#__PURE__*/_react.default.createElement(_ui.Button, {
    variant: "primary",
    size: "large",
    icon: "check",
    disabled: !props.initialSetupDone || !props.dateModesMatch,
    onClick: props.onDoneClick
  }, "Done")));
}

function BlockContainer(_ref) {
  var children = _ref.children;
  return /*#__PURE__*/_react.default.createElement("div", {
    id: "Scheduler-Block",
    width: "100%",
    height: "100vh"
  }, /*#__PURE__*/_react.default.createElement(_ui.ViewportConstraint, {
    minSize: {
      width: 600,
      height: 600
    }
  }, /*#__PURE__*/_react.default.createElement(_ui.Box, {
    padding: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  }, children)));
}

(0, _ui.initializeBlock)(function () {
  return /*#__PURE__*/_react.default.createElement(SchedulerBlock, null);
});