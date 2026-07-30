/**
 * Utility functions for managing employee shifts and history
 */

/**
 * Returns the active shift for an employee on a given date by evaluating their shiftHistory.
 * If no history exists, or the date is before any recorded history, it falls back to a provided default or null.
 * 
 * @param {Object} employee - The employee object containing shiftHistory (and optionally a populated top-level shift as fallback).
 * @param {Date|String} date - The date to evaluate the shift for.
 * @returns {Object|null} - The populated shift object active on that date, or null.
 */
const getActiveShiftForDate = (employee, date) => {
    if (!employee) return null;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // If there is shift history, find the most recent shift assigned on or before the target date
    if (employee.shiftHistory && employee.shiftHistory.length > 0) {
        // Sort history by effectiveFrom descending (newest first)
        const sortedHistory = [...employee.shiftHistory].sort((a, b) => 
            new Date(b.effectiveFrom) - new Date(a.effectiveFrom)
        );

        // Find the first record where effectiveFrom <= targetDate
        for (const record of sortedHistory) {
            const effectiveDate = new Date(record.effectiveFrom);
            effectiveDate.setHours(0, 0, 0, 0);

            if (effectiveDate <= targetDate) {
                return record.shift; // This should be a populated shift object!
            }
        }
    }

    // Fallback: If the targetDate is before ANY history, or there is no history, 
    // return the top-level shift (which might be the oldest/only shift).
    return employee.shift || null;
};

module.exports = {
    getActiveShiftForDate
};
