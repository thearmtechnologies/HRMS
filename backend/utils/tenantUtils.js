const mongoose = require('mongoose');

/**
 * Finds a single record scoped to the company
 */
const findCompanyRecord = async (Model, id, company, populateOptions = null) => {
    let query = Model.findOne({ _id: id, company });
    if (populateOptions) {
        query = query.populate(populateOptions);
    }
    return await query.exec();
};

/**
 * Finds multiple records scoped to the company
 */
const findCompanyRecords = async (Model, filter, company, populateOptions = null, sortOptions = null) => {
    let query = Model.find({ ...filter, company });
    if (populateOptions) {
        query = query.populate(populateOptions);
    }
    if (sortOptions) {
        query = query.sort(sortOptions);
    }
    return await query.exec();
};

/**
 * Finds a single record matching a filter scoped to the company
 */
const findOneCompanyRecord = async (Model, filter, company, populateOptions = null) => {
    let query = Model.findOne({ ...filter, company });
    if (populateOptions) {
        query = query.populate(populateOptions);
    }
    return await query.exec();
};

/**
 * Updates a single record scoped to the company
 */
const updateCompanyRecord = async (Model, id, company, updateData, options = { new: true, runValidators: true }) => {
    // Ensure company cannot be updated maliciously
    if (updateData.company) {
        delete updateData.company;
    }
    return await Model.findOneAndUpdate({ _id: id, company }, updateData, options);
};

/**
 * Deletes a single record scoped to the company
 */
const deleteCompanyRecord = async (Model, id, company) => {
    return await Model.findOneAndDelete({ _id: id, company });
};

/**
 * Creates a new record scoped to the company
 */
const createCompanyRecord = async (Model, data, company) => {
    // Enforce company overrides any client provided value
    const finalData = { ...data, company };
    return await Model.create(finalData);
};

/**
 * Upserts a single record matching a filter scoped to the company
 */
const upsertCompanyRecord = async (Model, filter, company, updateData) => {
    if (updateData.company) {
        delete updateData.company;
    }
    return await Model.findOneAndUpdate({ ...filter, company }, updateData, { upsert: true, new: true, runValidators: true });
};

module.exports = {
    findCompanyRecord,
    findCompanyRecords,
    findOneCompanyRecord,
    updateCompanyRecord,
    deleteCompanyRecord,
    createCompanyRecord,
    upsertCompanyRecord
};
