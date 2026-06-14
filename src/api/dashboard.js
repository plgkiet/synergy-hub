import { cvApiFetch } from "./cvHttp";

/** @typedef {Object} DashboardDateFilter
 * @property {string} [startDate] ISO date (YYYY-MM-DD), inclusive start (UTC)
 * @property {string} [endDate] ISO date (YYYY-MM-DD), inclusive end (UTC)
 */

/** @typedef {Object} DashboardCountResponse
 * @property {number} count
 */

/** @typedef {Object} DashboardDistributionItem
 * @property {string} label
 * @property {number} count
 */

/** @typedef {Object} DashboardDistributionResponse
 * @property {number} total
 * @property {DashboardDistributionItem[]} items
 */

/** @typedef {Object} DashboardTrendPoint
 * @property {string} period
 * @property {string} periodStart
 * @property {number} jobs
 * @property {number} applications
 */

/** @typedef {Object} DashboardTrendResponse
 * @property {DashboardTrendPoint[]} points
 */

function buildDateParams({ startDate, endDate } = {}) {
  const params = new URLSearchParams();
  if (startDate) params.set("StartDate", startDate);
  if (endDate) params.set("EndDate", endDate);
  return params;
}

function dashboardPath(endpoint, dateFilter) {
  const params = buildDateParams(dateFilter);
  const qs = params.toString();
  return `/Dashboard/${endpoint}${qs ? `?${qs}` : ""}`;
}

/** @param {DashboardDateFilter} [dateFilter] */
export async function getTotalCvs(dateFilter) {
  return cvApiFetch(dashboardPath("total-cvs", dateFilter));
}

/** @param {DashboardDateFilter} [dateFilter] */
export async function getActiveJobs(dateFilter) {
  return cvApiFetch(dashboardPath("active-jobs", dateFilter));
}

/** @param {DashboardDateFilter} [dateFilter] */
export async function getApplications(dateFilter) {
  return cvApiFetch(dashboardPath("applications", dateFilter));
}

/** @param {DashboardDateFilter} [dateFilter] */
export async function getDashboardUsers(dateFilter) {
  return cvApiFetch(dashboardPath("users", dateFilter));
}

/** @param {DashboardDateFilter} [dateFilter] */
export async function getCvStatusDistribution(dateFilter) {
  return cvApiFetch(dashboardPath("cv-status-distribution", dateFilter));
}

/** @param {DashboardDateFilter} [dateFilter] */
export async function getCandidateRoleDistribution(dateFilter) {
  return cvApiFetch(dashboardPath("candidate-role-distribution", dateFilter));
}

/** @param {DashboardDateFilter} [dateFilter] */
export async function getJobsApplicationsTrend(dateFilter) {
  return cvApiFetch(dashboardPath("jobs-applications-trend", dateFilter));
}

/** @param {DashboardDateFilter} [dateFilter] */
export async function getCandidateExperienceDistribution(dateFilter) {
  return cvApiFetch(dashboardPath("candidate-experience-distribution", dateFilter));
}

/** @param {DashboardDateFilter} [dateFilter] */
export async function fetchDashboardData(dateFilter) {
  const [
    totalCvs,
    activeJobs,
    applications,
    users,
    cvStatus,
    roles,
    trend,
    experience,
  ] = await Promise.all([
    getTotalCvs(dateFilter),
    getActiveJobs(dateFilter),
    getApplications(dateFilter),
    getDashboardUsers(dateFilter),
    getCvStatusDistribution(dateFilter),
    getCandidateRoleDistribution(dateFilter),
    getJobsApplicationsTrend(dateFilter),
    getCandidateExperienceDistribution(dateFilter),
  ]);

  return {
    totalCvs,
    activeJobs,
    applications,
    users,
    cvStatus,
    roles,
    trend,
    experience,
  };
}
