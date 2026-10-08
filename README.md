# MediStock Manager

Module Details

Learner’s Details

SECTOR:

ICT

Regno:

 

SUB-SECTOR:

Information Technology (IT)

Class:

Level 6 IT B (Year 1) ……..

CERTIFICATE:

TVET Certificate VI in Information Technology

Trainer’s Details

Module (Code & Name):

ITLDF601 – Frontend development

Names:

Christian & Cyprien

Competence:

Develop Frontend 

Duration:

180min

Training Centre:

RP Karongi College

Date:

October 01, 2026

Type of evidence:

Performance evidence

Signature:

 

Integrated Situation /100Marks (To be scaled to 30 Marks)

TOPIC: PHARMACY INVENTORY MANAGEMENT SYSTEM

Scenario:

A pharmacy wants a modern web-based system for monitoring medicines, managing stock, recording sales, identifying expired and low-stock medicines, and generating inventory reports.

Students must develop the complete frontend application using React.js only. Since no backend is required, all data must be simulated using mock data and localStorage.

The application should provide a professional, responsive interface that allows pharmacy staff to manage medicines and monitor stock efficiently.

2. Required Technologies

Students must use:

• React.js

• Vite

• JavaScript ES6+

• React Router

• Material UI (MUI)

• Recharts

• HTML5/CSS3

• Browser localStorage

3. Required Pages

The application must contain at least:

1. Dashboard

2. Medicines

3. Medicine Details

4. Categories

5. Stock Management

6. Expired Medicines

7. Low Stock

8. Sales

9. Reports

Use React Router for navigation and dynamic routes such as:

/medicines/:medicineId

4. Dashboard

The dashboard should provide a quick overview of pharmacy operations.

Summary Cards

Display:

• Total medicines

• Total categories

• Total stock quantity

• Low-stock medicines

• Expired medicines

• Active medicines

• Today's sales

• Monthly sales

Additional Information

Display:

• Recently added medicines

• Recent sales

• Medicines close to expiration

• Low-stock alerts

• Recent stock movements

Use Material UI Cards, Chips, Icons, Alerts and responsive layouts.

5. Medicines Page

Create a medicine management table.

Display

• Medicine ID

• Medicine name

• Generic name

• Category

• Manufacturer

• Batch number

• Unit price

• Quantity

• Expiration date

• Reorder level

• Status

• Actions

Required Operations

Students must implement:

• Add medicine

• Edit medicine

• Delete medicine

• View medicine details

• Search medicine

• Filter by category

• Filter by stock status

• Filter by expiration status

• Sort medicines

• Clear filters

Use Material UI Table or DataGrid.

Medicine Form

The form should include:

• Medicine name

• Generic name

• Category

• Manufacturer

• Batch number

• Unit price

• Quantity

• Reorder level

• Expiration date

• Supplier

• Description

Implement:

• Controlled inputs

• Required-field validation

• Numeric validation

• Date validation

• Error messages

• Save and Cancel buttons

• Loading state

• Success notification

Store changes in localStorage.

6. Medicine Details Page

Create a dynamic medicine details page using:

/medicines/:medicineId

Display:

• Medicine information

• Category

• Manufacturer

• Batch number

• Current stock

• Unit price

• Expiration date

• Supplier

• Reorder level

• Stock status

Include sections or tabs for:

• Overview

• Stock History

• Sales History

7. Categories Page

Create a category management interface.

Example categories:

• Antibiotics

• Analgesics

• Antimalarials

• Vitamins

• Antiseptics

• Cardiovascular

• Diabetes

• Respiratory

Students must implement:

• Add category

• Edit category

• Delete category

• Search category

• View number of medicines per category

Display category name, description, number of medicines and status.

8. Stock Management

Create a page for recording and monitoring stock movements.

Stock Table

Display:

• Movement ID

• Medicine

• Batch number

• Movement type

• Quantity

• Previous stock

• New stock

• Date

• Staff/User

• Reason

Movement types may include:

• Stock In

• Stock Out

• Adjustment

• Return

Students should calculate the updated stock quantity dynamically.

Use localStorage to preserve stock movements.

9. Expired Medicines

Create a dedicated page that automatically identifies medicines whose expiration date has passed.

Display:

• Medicine

• Batch number

• Category

• Quantity

• Expiration date

• Days expired

• Status

• Action

Use Material UI Chips/Alerts to clearly indicate expired medicines.

Also identify medicines that are near expiration, for example within the next 30 days.

10. Low Stock Page

Automatically identify medicines where:

Current Stock <= Reorder Level

Display:

• Medicine

• Category

• Current stock

• Reorder level

• Difference

• Supplier

• Status

Provide a visual warning using Material UI Chips or Alerts.

Include a search and category filter.

11. Sales Page

Create a frontend sales management interface.

Sales Table

Display:

• Sale ID

• Date

• Medicine

• Quantity

• Unit price

• Total amount

• Customer

• Staff

• Payment method

Students must calculate:

Total = Quantity × Unit Price

Sales Features

Implement:

• Record sale

• Search sales

• Filter by date

• Filter by medicine

• Filter by payment method

• View sale details

• Calculate total sales

When a sale is recorded, the medicine's stock should be reduced in the frontend/localStorage data.

12. Reports Page

Create a reporting dashboard showing pharmacy inventory and sales information.

Reports should include:

• Current stock report

• Low-stock report

• Expired medicine report

• Medicine category report

• Sales report

• Monthly sales summary

Provide filters such as:

• Date range

• Category

• Medicine

• Stock status

Include buttons such as:

• Print Report

• Export/Download mock report

The export functionality may use frontend-generated CSV data or a simulated report.

13. Recharts Requirements

Students must use Recharts to create responsive charts.

Required Charts

Stock by Category

Use a:

• Bar Chart or Pie Chart

Show the quantity of medicines available in each category.

Monthly Sales

Use a:

• Line Chart or Bar Chart

Display sales totals for each month.

Expired vs Active Medicines

Use a:

• Pie Chart

Compare:

• Active medicines

• Expired medicines

Charts must use dynamic data from the application's state/localStorage rather than hard-coded chart values.

14. React Requirements

Students must demonstrate:

• Functional components

• Props

• State management

• Event handling

• Conditional rendering

• Lists and keys

• useState

• useEffect

• useMemo

• React Router

• Dynamic routes

• Controlled forms

• Form validation

• Reusable components

• LocalStorage

• Array methods such as map(), filter(), find(), reduce() and sort()

Create reusable components for items such as:

• Summary cards

• Tables

• Search/filter controls

• Forms

• Status chips

• Confirmation dialogs

• Charts

• Empty states

15. Material UI Requirements

Students should demonstrate appropriate use of:

• AppBar

• Drawer

• Card

• Table/DataGrid

• TextField

• Select

• MenuItem

• Button

• Dialog

• Alert

• Snackbar

• Chip

• Badge

• Tabs

• Tooltip

• IconButton

• CircularProgress

• MUI Icons

The interface must have a consistent professional pharmacy-management design.

16. Mock Data Requirements

The project must contain at least:

• 30 medicines

• 8 categories

• 20 stock movements

• 20 sales records

• 10 expired/near-expiry medicines

• 10 low-stock medicines

Students may create the data using JavaScript arrays and initialize it into localStorage.

17. Responsive Design

The system must work correctly on:

• Desktop

• Tablet

• Mobile

The navigation should use a responsive MUI Drawer/sidebar.

Tables should remain usable on smaller screens through responsive layouts or horizontal scrolling.

18. User Experience Requirements

Students must implement:

• Loading indicators

• Empty-state messages

• Form validation

• Error messages

• Success notifications

• Delete confirmation dialogs

• Search and filter feedback

• Expiration warnings

• Low-stock warnings

• Responsive navigation

All CRUD operations should provide appropriate user feedback.

19. Final Deliverables

Students must submit:

1. Complete React.js source code

2. package.json

3. README file

4. Screenshots of major pages

5. Sample/mock login credentials if login is implemented

6. Working localStorage functionality

7. Responsive interface

8. Short project demonstration

The README must include:

• Project description

• Technologies used

• Installation instructions

• How to run the application

• Main features

• Mock-data explanation

• Future improvements

20. Expected Outcome

At the end of the project, the student should have developed a professional React.js Pharmacy Inventory Management System capable of managing medicines, categories, stock, sales, expired medicines, low-stock alerts and reports.

The project should demonstrate practical mastery of React.js, React Router, Material UI, Recharts, reusable components, forms, state management, filtering, CRUD operations, localStorage and responsive frontend development.

 

Page 2 of 2

do this, use reactjs, and tailwind, recharts, Material UI (MUI),

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
