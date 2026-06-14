import { useCallback, useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Label,
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { fetchDashboardData } from "@/api/dashboard";
import FlexibleDataTable from "@/components/DataTable/FlexibleDataTable";
import Pagination from "@/components/Pagination/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "./AdminDashboardPage.css";

const { RangePicker } = DatePicker;

const COLORS = ["#2563eb", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444"];

const STATUS_COLORS = {
  Done: "#22c55e",
  Processing: "#2563eb",
  Failed: "#ef4444",
};

const getDefaultRange = (type) => {
  switch (type) {
    case "date":
      return [dayjs().subtract(6, "day"), dayjs()];

    case "month":
      return [dayjs().subtract(11, "month"), dayjs()];

    case "year":
      return [dayjs().subtract(4, "year"), dayjs()];

    default:
      return [dayjs().subtract(11, "month"), dayjs()];
  }
};

const LATEST_APPLICATIONS = [
  {
    id: 1,
    candidate: "Luong Vinh Hung",
    email: "cung0976a@gmail.com",
    phone: "0987654321",
    role: "Backend Developer",
    status: "Done",
  },
  {
    id: 2,
    candidate: "Do The Hoa",
    email: "ha@gmail.com",
    phone: "0987654321",
    role: "Backend Developer",
    status: "Done",
  },
  {
    id: 3,
    candidate: "Huynh Minh An",
    email: "an@gmail.com",
    phone: "0987654321",
    role: "Frontend Developer",
    status: "Done",
  },
  {
    id: 4,
    candidate: "Hoang Thanh Chi Bao",
    email: "bao@gmail.com",
    phone: "0987654321",
    role: "Frontend Developer",
    status: "Done",
  },
  {
    id: 5,
    candidate: "Nguyen Giang Thai Khang",
    email: "trung@gmail.com",
    phone: "0987654321",
    role: "Backend Developer",
    status: "Done",
  },
];

const APPLICATION_COLUMNS = [
  { key: "candidate", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "phone",
    label: "Phone",
    width: "180px",
  },
  {
    key: "role",
    label: "Role",
    width: "260px",
  },
  {
    key: "status",
    label: "Status",
    width: "160px",
    render: (row) => (
      <span className="dashboard-status-badge">{row.status}</span>
    ),
  },
];

const APPLICATIONS_PAGE_SIZE = 5;

function toDateFilter(dateRange) {
  if (!dateRange?.[0] || !dateRange?.[1]) return {};
  return {
    startDate: dateRange[0].format("YYYY-MM-DD"),
    endDate: dateRange[1].format("YYYY-MM-DD"),
  };
}

function distributionToChartData(items = []) {
  return items.map((item) => ({
    name: item.label,
    value: item.count,
  }));
}

function formatCount(value) {
  if (value == null) return "—";
  return Number(value).toLocaleString();
}

const CustomLegend = ({ payload }) => (
  <div className="dashboard-chart-legend">
    {payload?.map((entry) => (
      <div key={entry.value} className="dashboard-chart-legend-item">
        <span
          className="dashboard-chart-legend-color"
          style={{
            background: entry.color,
          }}
        />
        <span className="dashboard-chart-legend-label">{entry.value}</span>
        <strong className="dashboard-chart-legend-value">
          {entry.payload?.value}
        </strong>
      </div>
    ))}
  </div>
);

function ChartLoading({ height = 320 }) {
  return (
    <div
      className="dashboard-chart-loading"
      style={{ minHeight: height }}
    >
      <LoadingSpinner />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { enqueueSnackbar } = useSnackbar();

  const [openFilter, setOpenFilter] = useState(false);
  const [periodType, setPeriodType] = useState("month");
  const [dateRange, setDateRange] = useState(getDefaultRange("month"));
  const [loading, setLoading] = useState(true);
  const [applicationsPage, setApplicationsPage] = useState(1);

  const [totalCvs, setTotalCvs] = useState(null);
  const [activeJobs, setActiveJobs] = useState(null);
  const [applications, setApplications] = useState(null);
  const [users, setUsers] = useState(null);
  const [cvStatus, setCvStatus] = useState({ total: 0, items: [] });
  const [roles, setRoles] = useState({ total: 0, items: [] });
  const [trend, setTrend] = useState({ points: [] });
  const [experience, setExperience] = useState({ total: 0, items: [] });

  const statusData = useMemo(
    () => distributionToChartData(cvStatus.items),
    [cvStatus.items],
  );

  const roleData = useMemo(
    () => distributionToChartData(roles.items),
    [roles.items],
  );

  const experienceData = useMemo(
    () =>
      experience.items.map((item) => ({
        range: item.label,
        count: item.count,
      })),
    [experience.items],
  );

  const jobsVsApplicationsData = trend.points;

  const applicationsTotalCount = LATEST_APPLICATIONS.length;
  const applicationsTotalPages = Math.ceil(
    applicationsTotalCount / APPLICATIONS_PAGE_SIZE,
  );
  const pagedApplications = LATEST_APPLICATIONS.slice(
    (applicationsPage - 1) * APPLICATIONS_PAGE_SIZE,
    applicationsPage * APPLICATIONS_PAGE_SIZE,
  );

  const loadDashboard = useCallback(
    async (range = dateRange) => {
      if (!range?.[0] || !range?.[1]) return;

      if (range[0].isAfter(range[1])) {
        enqueueSnackbar("Start date must be before or equal to end date", {
          variant: "error",
        });
        return;
      }

      try {
        setLoading(true);
        const data = await fetchDashboardData(toDateFilter(range));

        setTotalCvs(data.totalCvs?.count ?? 0);
        setActiveJobs(data.activeJobs?.count ?? 0);
        setApplications(data.applications?.count ?? 0);
        setUsers(data.users?.count ?? 0);
        setCvStatus(data.cvStatus ?? { total: 0, items: [] });
        setRoles(data.roles ?? { total: 0, items: [] });
        setTrend(data.trend ?? { points: [] });
        setExperience(data.experience ?? { total: 0, items: [] });
      } catch (err) {
        enqueueSnackbar(err?.message || "Failed to load dashboard", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [dateRange, enqueueSnackbar],
  );

  useEffect(() => {
    loadDashboard(dateRange);
  }, [dateRange, loadDashboard]);

  const handlePeriodChange = (value) => {
    setPeriodType(value);
    setDateRange(getDefaultRange(value));
  };

  const handleDateChange = (range) => {
    if (!range) {
      setDateRange(getDefaultRange(periodType));
      return;
    }
    setDateRange(range);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-filters">
        <div className="dashboard-filter">
          <button
            type="button"
            className="dashboard-filter-trigger"
            onClick={() => setOpenFilter((v) => !v)}
          >
            <span>
              {periodType === "date"
                ? "Day"
                : periodType === "month"
                  ? "Month"
                  : "Year"}
            </span>

            <i
              className={`fa-solid fa-chevron-down ${
                openFilter ? "is-open" : ""
              }`}
            />
          </button>

          {openFilter && (
            <div className="dashboard-filter-menu">
              <button
                type="button"
                className="dashboard-filter-option"
                onClick={() => {
                  handlePeriodChange("date");
                  setOpenFilter(false);
                }}
              >
                Day
              </button>

              <button
                type="button"
                className="dashboard-filter-option"
                onClick={() => {
                  handlePeriodChange("month");
                  setOpenFilter(false);
                }}
              >
                Month
              </button>

              <button
                type="button"
                className="dashboard-filter-option"
                onClick={() => {
                  handlePeriodChange("year");
                  setOpenFilter(false);
                }}
              >
                Year
              </button>
            </div>
          )}
        </div>

        <RangePicker
          picker={periodType}
          value={dateRange}
          onChange={handleDateChange}
          className="dashboard-filter-range"
        />
      </div>

      <div className="dashboard-kpis">
        <div className="dashboard-kpi">
          <span>Total CVs</span>
          <strong>
            {loading ? <LoadingSpinner inline /> : formatCount(totalCvs)}
          </strong>
        </div>

        <div className="dashboard-kpi">
          <span>Active Jobs</span>
          <strong>
            {loading ? <LoadingSpinner inline /> : formatCount(activeJobs)}
          </strong>
        </div>

        <div className="dashboard-kpi">
          <span>Applications</span>
          <strong>
            {loading ? <LoadingSpinner inline /> : formatCount(applications)}
          </strong>
        </div>

        <div className="dashboard-kpi">
          <span>Users</span>
          <strong>
            {loading ? <LoadingSpinner inline /> : formatCount(users)}
          </strong>
        </div>
      </div>

      <div className="dashboard-two-cols">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">CV Status Distribution</div>
          {loading ? (
            <ChartLoading />
          ) : (
            <div className="dashboard-chart-layout">
              <div className="dashboard-chart-canvas">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      innerRadius={75}
                      outerRadius={110}
                    >
                      {statusData.map((item) => (
                        <Cell
                          key={item.name}
                          fill={STATUS_COLORS[item.name] || COLORS[0]}
                        />
                      ))}
                      <Label
                        position="center"
                        content={() => (
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x="50%"
                              dy="-0.4em"
                              className="dashboard-donut-total"
                            >
                              {(cvStatus.total || 0).toLocaleString()}
                            </tspan>

                            <tspan
                              x="50%"
                              dy="1.8em"
                              className="dashboard-donut-label"
                            >
                              Total CVs
                            </tspan>
                          </text>
                        )}
                      />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <CustomLegend
                payload={statusData.map((item) => ({
                  value: item.name,
                  color: STATUS_COLORS[item.name] || COLORS[0],
                  payload: item,
                }))}
              />
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            Candidate Role Distribution
          </div>
          {loading ? (
            <ChartLoading />
          ) : (
            <div className="dashboard-chart-layout">
              <div className="dashboard-chart-canvas">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      dataKey="value"
                      innerRadius={75}
                      outerRadius={110}
                    >
                      {roleData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}

                      <Label
                        position="center"
                        content={() => (
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x="50%"
                              dy="-0.4em"
                              className="dashboard-donut-total"
                            >
                              {(roles.total || 0).toLocaleString()}
                            </tspan>

                            <tspan
                              x="50%"
                              dy="1.8em"
                              className="dashboard-donut-label"
                            >
                              Candidates
                            </tspan>
                          </text>
                        )}
                      />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <CustomLegend
                payload={roleData.map((item, index) => ({
                  value: item.name,
                  color: COLORS[index % COLORS.length],
                  payload: item,
                }))}
              />
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">Jobs vs Applications Trend</div>

        {loading ? (
          <ChartLoading height={360} />
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart
              data={jobsVsApplicationsData}
              margin={{
                top: 30,
                right: 20,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="period" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="jobs"
                name="Jobs"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />

              <Line
                type="monotone"
                dataKey="applications"
                name="Applications"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          Candidate Experience Distribution
        </div>

        {loading ? (
          <ChartLoading height={360} />
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={experienceData}
              margin={{
                top: 30,
                right: 20,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#2563eb">
                <LabelList
                  dataKey="count"
                  position="top"
                  className="dashboard-bar-label"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">Latest Applications</div>

        <FlexibleDataTable
          columns={APPLICATION_COLUMNS}
          data={pagedApplications}
          rowKey="id"
        />

        <Pagination
          page={applicationsPage}
          pageSize={APPLICATIONS_PAGE_SIZE}
          totalCount={applicationsTotalCount}
          totalPages={applicationsTotalPages}
          onPageChange={setApplicationsPage}
          onPageSizeChange={() => {}}
        />
      </div>
    </div>
  );
}
