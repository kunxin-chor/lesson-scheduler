# Admin User Stories

## 1. As an admin, I want to create a lesson plane so that I can organize lessons and materials

## 2. As an admin, I want to add what prelearning materials are needed for each lesson in the lesson plan so that students know what to study before class

## 3. As an admin, I want to add what are the guided instructions for each lesson in the lesson plan so that students would do those before class

## 4. As an admin, I want to add hands-on activities for each lesson in the lesson plan so that students can practice what they learned

## 5. As an admin, I want to be able to create a lesson plan so that I can plan lessons

## 6. As an adimin, I want to be able to duplicate an existing plan so that I can create a new one by modifying an existing one

## 7. As an admin, I want to be able to select a lesson plan so that I can edit it

## 8. As an admin, I need to able to edit and view all the lessons at the same time for one lesson plan so that I can manage them efficiently

## 9. As an admin, I want to be able to create an intake and apply a lesson plan to it, so that I can manage multiple courses at the same time

## 10. As an admin, I need to generate a calendar view for an intake to show students which lessons are coming up and which materials they need to prepare

* Expected Behaviour: 
    - After the admin enters the start date of the course, the calendar view should automatically generate and show all lessons in a monthly or weekly format, with links to the corresponding lesson details and materials.
    - The calendar view should be updated automatically when the admin adds or modifies lessons.
    - The calendar view should be exported in a PDF format for students to print or save.
    - The calender view should automatically adjust to the number of lessons in the course
    - The admin should be able to specify which day of the week the course runs on (e.g., Monday, Wednesday, Friday) and the generation should be based on that
    - The calendar view should account for weekends, and holidays
    - The list of public holidays should be configurable by the admin
    - The admin should be able to configure which of the lesson days are exception (i.e, have no classes despite usually having classes)

* Acceptance Criteria: The calendar view is generated correctly and all links work as expected.



## 11. As am admin, I want to be able to save the lesson plan, so that I can reuse it for future intakes
* Expected Behaviour: 
    - The admin should be able to save the current lesson plan
    - The admin should be able to load a lesson plan and apply it to a new intake
        - The admin should be able to set the start date of the intake, which days it have lessons, and what are the exceptions (i.e, have no classes despite usually having classes)
    - The admin should be able to edit a saved lesson plan and save it again
    - The admin should be able to delete a lesson plan
    - The admin should be able to see a list of all lesson plans
    - The admin should be able to see the details of a lesson plan
