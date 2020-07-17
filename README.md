# Scheduler Block
This block allows users to select one or more records in a grid view, and then displays all of the related "schedule" records on a calendar interface. Users are then able to click and drag dates on the calendar to select a start and end time, but only if that day/time slot is unoccupied by an existing record. Once dates are selected, a new scheduled record is added to the calendar and is opened in Airtable's expanded record modal to allow users to quickly fill in the remaining fields.


[![video preview](http://img.youtube.com/vi/0Md7Iu0X5l4/0.jpg)](http://www.youtube.com/watch?v=0Md7Iu0X5l4 "Video preview")

## How to remix this block
1. Create a new base (or you can use an existing base).
2. Create a new block in your base (see [Create a new block](https://airtable.com/developers/blocks/guides/hello-world-tutorial#create-a-new-block), selecting "Remix from Github" as your template.
3. Install FullCalendar.io by running `npm install --save @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction`
4. Install Moment.js by running `npm install moment --save`
5. From the root of your new block, run `block run`.