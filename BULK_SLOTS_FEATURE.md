# Bulk Slot Creation Feature

## Overview
This feature allows you to create intake slots using comma-delimited date strings with time slot indicators, making it easy to quickly set up class schedules.

## Format
```
DD/MM/YYYY M/A/E
```

Where:
- **DD/MM/YYYY**: Date in day/month/year format
- **M**: Morning slot
- **A**: Afternoon slot
- **E**: Evening slot

## Examples

### Single Entry
```
01/12/2026 M
```
Creates a morning slot on December 1st, 2026

### Multiple Entries
```
01/12/2026 M, 03/12/2026 A, 05/12/2026 E
```
Creates:
- Morning slot on December 1st, 2026
- Afternoon slot on December 3rd, 2026
- Evening slot on December 5th, 2026

## Usage

### 1. Creating a New Intake with Bulk Slots

1. Navigate to the Intakes page
2. Click "Create New Intake"
3. Fill in the intake name
4. Select "Bulk Slot Input" as the generation method
5. Enter your comma-delimited date strings in the text area
6. Submit the form

**Note**: When using bulk slot input, the start date field is optional.

### 2. Adding Bulk Slots to an Existing Intake

1. Open the Class Slot Manager for an intake
2. Find the "Add Bulk Class Slots" section
3. Enter your comma-delimited date strings
4. Click "Add Bulk Slots"
5. Save your changes

## Backend API

### Endpoint
```
POST /api/intakes/:id/bulk-slots
```

### Request Body
```json
{
  "bulkString": "01/12/2026 M, 03/12/2026 A, 05/12/2026 E"
}
```

### Response
Returns the updated intake object with the new slots merged into the existing class slots.

## Implementation Details

### Frontend Components
- **BulkSlotInput.jsx**: Reusable component for bulk slot input with validation
- **IntakeFormModal.jsx**: Updated to include bulk generation method
- **ClassSlotManager.jsx**: Includes BulkSlotInput for adding slots to existing intakes

### Backend Services
- **intakeService.js**: `parseBulkSlotString()` and `addBulkSlots()` functions
- **intakeController.js**: `addBulkSlots()` endpoint handler
- **intakeRoutes.js**: Route definition for bulk slots endpoint

### Validation
- Validates date format (DD/MM/YYYY)
- Validates time slot codes (M, A, E)
- Prevents duplicate slots (same date and time slot)
- Provides error messages for invalid entries

## Notes
- Slots are automatically sorted by date
- Duplicate slots (same date and time) are automatically filtered out
- Invalid entries are reported but don't prevent valid entries from being added
- All bulk-created slots are marked with `isManuallyAdded: true`
