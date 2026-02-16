// Report Service
const Report = require('../models/Report');
const { NotFoundError } = require('../utils/errorHandler');

const getReports = async (filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const query = Report.find(filters)
    .populate('generatedBy')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const [reports, total] = await Promise.all([
    query.exec(),
    Report.countDocuments(filters)
  ]);

  return {
    reports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getReportById = async (id) => {
  const report = await Report.findById(id).populate('generatedBy');
  if (!report) {
    throw new NotFoundError('Report');
  }
  return report;
};

const createReport = async (reportData) => {
  const report = new Report(reportData);
  await report.save();
  await report.populate('generatedBy');
  return report;
};

const updateReport = async (id, updateData) => {
  updateData.updatedAt = new Date();
  const report = await Report.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate('generatedBy');
  
  if (!report) {
    throw new NotFoundError('Report');
  }
  return report;
};

const deleteReport = async (id) => {
  const report = await Report.findByIdAndDelete(id);
  if (!report) {
    throw new NotFoundError('Report');
  }
  return report;
};

const generateReport = async (reportData, userId) => {
  reportData.generatedBy = userId;
  const report = new Report(reportData);
  
  // Simulate data generation (would be replaced with actual report generation logic)
  report.data = {
    generatedAt: new Date(),
    summary: 'Report generated successfully',
    recordCount: 0
  };

  await report.save();
  await report.populate('generatedBy');
  return report;
};

const getReportsByUser = async (userId, page = 1, limit = 20) => {
  return getReports({ generatedBy: userId }, page, limit);
};

const getReportsByType = async (type, page = 1, limit = 20) => {
  return getReports({ type }, page, limit);
};

module.exports = {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  generateReport,
  getReportsByUser,
  getReportsByType
};
