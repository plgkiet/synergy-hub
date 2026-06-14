import { useState } from "react";
import Pagination from "@/components/Pagination/Pagination";
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
import FlexibleDataTable from "@/components/DataTable/FlexibleDataTable";
import "./AdminDashboardPage.css";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const COLORS = ["#2563eb", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444"];

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

export default function AdminDashboardPage() {
  const statusData = [
    { name: "Done", value: 1245 },
    { name: "Processing", value: 32 },
    { name: "Failed", value: 8 },
  ];

  const roleData = [
    { name: "Backend", value: 45 },
    { name: "Frontend", value: 25 },
    { name: "Data", value: 15 },
    { name: "Tester", value: 10 },
    { name: "Others", value: 5 },
  ];

  const trendData = [
    { date: "01 Jun", value: 12 },
    { date: "02 Jun", value: 18 },
    { date: "03 Jun", value: 30 },
    { date: "04 Jun", value: 27 },
    { date: "05 Jun", value: 35 },
    { date: "06 Jun", value: 42 },
    { date: "07 Jun", value: 39 },
  ];

  const jobsVsApplicationsData = [
    { period: "Jan", jobs: 8, applications: 95 },
    { period: "Feb", jobs: 10, applications: 120 },
    { period: "Mar", jobs: 12, applications: 160 },
    { period: "Apr", jobs: 15, applications: 210 },
    { period: "May", jobs: 18, applications: 280 },
    { period: "Jun", jobs: 20, applications: 340 },
  ];

  const latestApplications = [
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

  const columns = [
    {
      key: "candidate",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
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

  const totalStatus = statusData.reduce((sum, item) => sum + item.value, 0);
  const totalRoles = roleData.reduce((sum, item) => sum + item.value, 0);

  const PAGE_SIZE = 5;

  const [page, setPage] = useState(1);
  const totalCount = latestApplications.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const pagedApplications = latestApplications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const [openFilter, setOpenFilter] = useState(false);
  const [periodType, setPeriodType] = useState("month");
  const [dateRange, setDateRange] = useState(getDefaultRange("month"));

  const handlePeriodChange = (value) => {
    setPeriodType(value);
    setDateRange(getDefaultRange(value));
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
          onChange={setDateRange}
          className="dashboard-filter-range"
        />
      </div>

      <div className="dashboard-kpis">
        <div className="dashboard-kpi">
          <span>Total CVs</span>
          <strong>1,245</strong>
        </div>

        <div className="dashboard-kpi">
          <span>Active Jobs</span>
          <strong>18</strong>
        </div>

        <div className="dashboard-kpi">
          <span>Applications</span>
          <strong>567</strong>
        </div>

        <div className="dashboard-kpi">
          <span>Users</span>
          <strong>42</strong>
        </div>
      </div>

      <div className="dashboard-two-cols">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">CV Status Distribution</div>
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
                    {statusData.map((item, index) => (
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
                            {totalStatus.toLocaleString()}
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
              payload={statusData.map((item, index) => ({
                value: item.name,
                color: COLORS[index],
                payload: item,
              }))}
            />
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            Candidate Role Distribution
          </div>
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
                            {totalRoles}
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
                color: COLORS[index],
                payload: item,
              }))}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">Jobs vs Applications Trend</div>

        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={jobsVsApplicationsData}>
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
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">CV Upload Trend</div>

        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#2563eb">
              <LabelList
                dataKey="value"
                position="top"
                className="dashboard-bar-label"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">Latest Applications</div>

        <FlexibleDataTable
          columns={columns}
          data={pagedApplications}
          rowKey="id"
        />

        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={() => {}}
        />
      </div>
    </div>
  );
}
