import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import "./ExploreMyData.css";

const API_URL = "http://https://focuse-guard-ai-q44i.vercel.app";


function ExploreMyData() {

  const navigate = useNavigate();

  const userId =
    localStorage.getItem("user_id") || "1";


  // =====================================================
  // STATE
  // =====================================================

  const [activeCategory, setActiveCategory] =
    useState("usage");

  const [period, setPeriod] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("recent");

  const [showGlossary, setShowGlossary] =
    useState(false);

  const [showExport, setShowExport] =
    useState(false);

  const [exportFormat, setExportFormat] =
    useState("json");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [usageData, setUsageData] =
    useState([]);

  const [sessionData, setSessionData] =
    useState([]);


  // =====================================================
  // LOAD REAL DATABASE DATA
  // =====================================================

  useEffect(() => {

    loadData();

  }, [userId, period]);


  const loadData = async () => {

    try {

      setLoading(true);

      setError("");


      // -----------------------------------------
      // APP USAGE / MOCK DATA
      // -----------------------------------------

      const usageResponse =
        await fetch(
          `${API_URL}/explore-data/${userId}?period=${period}`
        );


      if (!usageResponse.ok) {

        throw new Error(
          "Unable to load activity data"
        );

      }


      const usageJson =
        await usageResponse.json();


      const actualUsage =
        Array.isArray(usageJson.data)
          ? usageJson.data
          : [];


      setUsageData(actualUsage);


      // -----------------------------------------
      // FOCUS SESSIONS
      // -----------------------------------------

      try {

        const sessionResponse =
          await fetch(
            `${API_URL}/focus-sessions/${userId}?period=${period}`
          );


        if (sessionResponse.ok) {

          const sessionJson =
            await sessionResponse.json();


          setSessionData(
            Array.isArray(sessionJson)
              ? sessionJson
              : []
          );

        } else {

          setSessionData([]);

        }

      } catch {

        setSessionData([]);

      }

    } catch (err) {

      console.error(
        "Explore My Data error:",
        err
      );

      setError(
        "Unable to load your FocusGuard data."
      );

      setUsageData([]);

      setSessionData([]);

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = [

    {
      id: "sessions",
      icon: "🎯",
      label: "Session Logs",
      description:
        "Your focus session activity"
    },

    {
      id: "usage",
      icon: "🌐",
      label: "App & Site Usage",
      description:
        "Applications and websites you used"
    },

    {
      id: "distractions",
      icon: "🚨",
      label: "Distraction Events",
      description:
        "Non-productive activity"
    },

    {
      id: "productivity",
      icon: "🧠",
      label: "Productivity Log",
      description:
        "Productivity classifications"
    },

    {
      id: "recommendations",
      icon: "🤖",
      label: "Recommendation History",
      description:
        "AI recommendations"
    },

    {
      id: "goals",
      icon: "🔥",
      label: "Streak & Goals",
      description:
        "Goals and streak records"
    }

  ];


  // =====================================================
  // PRODUCTIVITY DATA
  // =====================================================

  const productivityData =
    useMemo(() => {

      return usageData.filter(
        (item) =>
          item.productivity !== null &&
          item.productivity !== undefined &&
          item.productivity !== ""
      );

    }, [usageData]);


  // =====================================================
  // DISTRACTION DATA
  // =====================================================

  const distractionData =
    useMemo(() => {

      return usageData.filter(
        (item) => {

          const productivity =
            String(
              item.productivity || ""
            ).toLowerCase();

          return (
            productivity.includes(
              "non"
            ) ||
            Number(
              item.switch_count || 0
            ) > 0
          );

        }
      );

    }, [usageData]);


  // =====================================================
  // GET CURRENT DATA
  // =====================================================

  const currentData =
    useMemo(() => {

      switch (activeCategory) {

        case "sessions":
          return sessionData;

        case "usage":
          return usageData;

        case "distractions":
          return distractionData;

        case "productivity":
          return productivityData;

        case "recommendations":
          return [];

        case "goals":
          return [];

        default:
          return usageData;

      }

    }, [
      activeCategory,
      sessionData,
      usageData,
      distractionData,
      productivityData
    ]);


  // =====================================================
  // HELPERS
  // =====================================================

  const getTimestamp = (record) => {

    const value =
      record?.created_at ||
      record?.start_time ||
      record?.date ||
      record?.timestamp;


    if (!value) {
      return 0;
    }


    const timestamp =
      new Date(value).getTime();


    return Number.isNaN(timestamp)
      ? 0
      : timestamp;

  };


  const getDuration = (record) => {

    return Number(
      record?.duration_minutes ||
      record?.duration ||
      record?.minutes ||
      0
    );

  };


  const getSwitchCount = (record) => {

    return Number(
      record?.switch_count ||
      0
    );

  };


  const getWebsite = (record) => {

    return (
      record?.website ||
      record?.app ||
      record?.application ||
      "Unknown activity"
    );

  };


  const getProductivity = (record) => {

    if (
      record?.productivity !==
      null &&
      record?.productivity !==
      undefined
    ) {

      return String(
        record.productivity
      );

    }

    return "Not classified";

  };


  const formatDate = (record) => {

    const timestamp =
      getTimestamp(record);


    if (!timestamp) {

      return "Date not available";

    }


    return new Date(
      timestamp
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  };


  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const currentRecords =
    useMemo(() => {

      let records =
        [...currentData];


      // SEARCH

      const searchValue =
        search
          .trim()
          .toLowerCase();


      if (searchValue) {

        records =
          records.filter(
            (record) =>
              JSON.stringify(
                record
              )
                .toLowerCase()
                .includes(
                  searchValue
                )
          );

      }


      // SORT

      records.sort(
        (a, b) => {

          if (
            sortBy ===
            "recent"
          ) {

            return (
              getTimestamp(b) -
              getTimestamp(a)
            );

          }


          if (
            sortBy ===
            "longest"
          ) {

            return (
              getDuration(b) -
              getDuration(a)
            );

          }


          if (
            sortBy ===
            "mostDistracted"
          ) {

            return (
              getSwitchCount(b) -
              getSwitchCount(a)
            );

          }


          return 0;

        }
      );


      return records;

    }, [
      currentData,
      search,
      sortBy
    ]);


  // =====================================================
  // SUMMARY
  // =====================================================

  const totalRecords =
    usageData.length +
    sessionData.length;


  const productiveCount =
    usageData.filter(
      (item) =>
        String(
          item.productivity || ""
        ).toLowerCase()
        === "productive"
    ).length;


  const nonProductiveCount =
    usageData.filter(
      (item) =>
        String(
          item.productivity || ""
        ).toLowerCase()
        .includes("non")
    ).length;


  const lastActivity =
    usageData.length > 0
      ? [...usageData].sort(
          (a, b) =>
            getTimestamp(b) -
            getTimestamp(a)
        )[0]
      : sessionData.length > 0
        ? [...sessionData].sort(
            (a, b) =>
              getTimestamp(b) -
              getTimestamp(a)
          )[0]
        : null;


  // =====================================================
  // EXPLANATION
  // =====================================================

  const getExplanation =
    (record) => {

      if (
        activeCategory ===
        "sessions"
      ) {

        const duration =
          getDuration(record);


        return duration
          ? `You spent approximately ${duration} minutes in this focus session.`
          : "This is a recorded focus session.";

      }


      if (
        activeCategory ===
        "usage"
      ) {

        const website =
          getWebsite(record);

        const duration =
          getDuration(record);


        if (duration) {

          return `FocusGuard recorded ${website} for approximately ${duration} minutes.`;

        }


        return `FocusGuard recorded activity from ${website}.`;

      }


      if (
        activeCategory ===
        "distractions"
      ) {

        const switches =
          getSwitchCount(record);


        return `This activity has ${switches} recorded switch${switches === 1 ? "" : "es"} and was identified as potentially distracting.`;

      }


      if (
        activeCategory ===
        "productivity"
      ) {

        return `FocusGuard classified this activity as ${getProductivity(record)}.`;

      }


      return "FocusGuard recorded this activity.";

    };


  // =====================================================
  // DELETE FROM CURRENT VIEW
  // =====================================================

  const deleteRecord = (
    record
  ) => {

    const confirmed =
      window.confirm(
        "Remove this record from the current view?"
      );


    if (!confirmed) {
      return;
    }


    setUsageData(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !==
            record.id
        )
    );

  };


  // =====================================================
  // FLAG
  // =====================================================

  const flagRecord = () => {

    window.alert(
      "Thanks. This record has been flagged as potentially inaccurate."
    );

  };


  // =====================================================
  // EXPORT
  // =====================================================

  const getExportData = () => {

    return {

      exportedAt:
        new Date().toISOString(),

      userId,

      sessionLogs:
        sessionData,

      appSiteUsage:
        usageData,

      distractionEvents:
        distractionData,

      productivityClassification:
        productivityData,

      recommendationHistory: [],

      streakAndGoalRecords: []

    };

  };


  const downloadBlob = (
    blob,
    filename
  ) => {

    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href = url;

    link.download =
      filename;


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );

    setShowExport(false);

  };


  const downloadJSON = () => {

    const exportData =
      getExportData();


    const blob =
      new Blob(
        [
          JSON.stringify(
            exportData,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );


    downloadBlob(
      blob,
      "focusguard-my-data.json"
    );

  };


  const downloadCSV = () => {

    const rows = [];


    usageData.forEach(
      (record) => {

        rows.push({

          category:
            "App & Site Usage",

          id:
            record.id,

          website:
            record.website,

          switch_count:
            record.switch_count,

          switches:
            record.switches,

          duration_minutes:
            record.duration_minutes,

          productivity:
            record.productivity,

          created_at:
            record.created_at

        });

      }
    );


    sessionData.forEach(
      (record) => {

        rows.push({

          category:
            "Focus Session",

          id:
            record.id,

          website:
            "",

          switch_count:
            "",

          switches:
            "",

          duration_minutes:
            record.duration_minutes,

          productivity:
            "",

          created_at:
            record.start_time

        });

      }
    );


    if (!rows.length) {

      window.alert(
        "There is no data available to export."
      );

      return;

    }


    const headers =
      [
        ...new Set(
          rows.flatMap(
            (row) =>
              Object.keys(
                row
              )
          )
        )
      ];


    const csvRows = [
      headers.join(",")
    ];


    rows.forEach(
      (row) => {

        csvRows.push(

          headers
            .map(
              (header) => {

                const value =
                  row[header] ??
                  "";


                return `"${String(
                  value
                ).replace(
                  /"/g,
                  '""'
                )}"`;

              }
            )
            .join(",")

        );

      }
    );


    const blob =
      new Blob(
        [
          csvRows.join(
            "\n"
          )
        ],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );


    downloadBlob(
      blob,
      "focusguard-my-data.csv"
    );

  };


  const handleDownload = () => {

    if (
      exportFormat ===
      "csv"
    ) {

      downloadCSV();

    } else {

      downloadJSON();

    }

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="explore-page">


      {/* HEADER */}

      <header className="explore-header">

        <div>

          <button
            className="explore-back"
            onClick={() =>
              navigate(
                "/settings"
              )
            }
          >
            ← Settings
          </button>


          <div className="explore-eyebrow">
            DATA & PRIVACY
          </div>


          <h1>
            Explore My Data
          </h1>


          <p>
            View the activity data
            FocusGuard has collected
            about your focus,
            productivity and
            distractions.
          </p>

        </div>


        <button
          className="explore-export-button"
          onClick={() =>
            setShowExport(true)
          }
        >
          📥 Download My Data
        </button>

      </header>


      <main className="explore-container">


        {/* TRANSPARENCY */}

        <section className="explore-banner">

          <div className="explore-banner-icon">
            🔐
          </div>


          <div>

            <h2>
              Your data, clearly explained
            </h2>


            <p>
              This page shows the
              actual activity data
              stored for your
              FocusGuard account.
            </p>


            <span>
              Data is loaded directly
              from your FocusGuard
              database.
            </span>

          </div>

        </section>


        {/* SUMMARY */}

        <section className="explore-summary">


          <div className="summary-card">

            <span>
              Total records
            </span>

            <strong>
              {totalRecords}
            </strong>

            <small>
              Activity + focus sessions
            </small>

          </div>


          <div className="summary-card">

            <span>
              Productive activities
            </span>

            <strong>
              {productiveCount}
            </strong>

            <small>
              From your activity data
            </small>

          </div>


          <div className="summary-card">

            <span>
              Last tracked activity
            </span>

            <strong>

              {lastActivity
                ? formatDate(
                    lastActivity
                  )
                : "No activity"}

            </strong>

          </div>

        </section>


        {/* CATEGORY TABS */}

        <section className="explore-card">

          <div className="category-tabs">

            {categories.map(
              (category) => (

                <button
                  key={
                    category.id
                  }

                  className={
                    activeCategory ===
                    category.id
                      ? "category-tab active"
                      : "category-tab"
                  }

                  onClick={() => {

                    setActiveCategory(
                      category.id
                    );

                    setSortBy(
                      "recent"
                    );

                    setSearch("");

                  }}
                >

                  <span>
                    {
                      category.icon
                    }
                  </span>


                  <div>

                    <strong>
                      {
                        category.label
                      }
                    </strong>


                    <small>
                      {
                        category.description
                      }
                    </small>

                  </div>

                </button>

              )
            )}

          </div>

        </section>


        {/* FILTERS */}

        <section className="explore-card">

          <div className="filter-bar">


            <select
              value={period}
              onChange={(e) =>
                setPeriod(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Time
              </option>

              <option value="today">
                Today
              </option>

              <option value="week">
                This Week
              </option>

              <option value="month">
                This Month
              </option>

            </select>


            <div className="explore-search">

              🔍

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }

                placeholder=
                  "Search activity..."
              />

            </div>


            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value
                )
              }
            >

              <option value="recent">
                Most Recent
              </option>

              <option value="longest">
                Longest
              </option>

              <option value="mostDistracted">
                Most Switches
              </option>

            </select>

          </div>

        </section>


        {/* RECORDS */}

        <section className="explore-card">


          <div className="records-heading">

            <div>

              <h2>

                {
                  categories.find(
                    (item) =>
                      item.id ===
                      activeCategory
                  )?.label
                }

              </h2>


              <span>
                {currentRecords.length}
                {" "}
                records
              </span>

            </div>


            <button
              className="glossary-button"
              onClick={() =>
                setShowGlossary(
                  !showGlossary
                )
              }
            >
              ⓘ What do these fields mean?
            </button>

          </div>


          {/* GLOSSARY */}

          {showGlossary && (

            <div className="glossary-box">

              <h3>
                Field Glossary
              </h3>


              <p>
                <strong>
                  Website:
                </strong>{" "}
                Application or website
                recorded by FocusGuard.
              </p>


              <p>
                <strong>
                  Duration:
                </strong>{" "}
                How long the activity
                lasted, in minutes.
              </p>


              <p>
                <strong>
                  Switch Count:
                </strong>{" "}
                Number of activity
                switches recorded.
              </p>


              <p>
                <strong>
                  Productivity:
                </strong>{" "}
                Productivity
                classification from
                your stored data.
              </p>


              <p>
                <strong>
                  Created At:
                </strong>{" "}
                Date and time when
                the activity was recorded.
              </p>

            </div>

          )}


          {loading ? (

            <div className="empty-data">
              Loading your actual data...
            </div>

          ) : error ? (

            <div className="empty-data error">
              {error}
            </div>

          ) : (

            activeCategory ===
            "recommendations" ||

            activeCategory ===
            "goals"

          ) ? (

            <div className="empty-data">

              <div>
                📭
              </div>

              <strong>
                No data available yet
              </strong>

              <span>
                This category is not
                connected to a database
                table yet.
              </span>

            </div>

          ) : currentRecords.length ===
            0 ? (

            <div className="empty-data">

              <div>
                📭
              </div>

              <strong>
                No records found
              </strong>

              <span>
                Try changing the
                date filter or
                search term.
              </span>

            </div>

          ) : (

            <div className="records-list">

              {currentRecords.map(
                (record, index) => (

                  <div
                    className="data-record"
                    key={
                      record.id ||
                      `${activeCategory}-${index}`
                    }
                  >


                    {/* RECORD HEADER */}

                    <div className="record-top">


                      <div className="record-title">

                        <span className="record-icon">

                          {
                            categories.find(
                              (item) =>
                                item.id ===
                                activeCategory
                            )?.icon
                          }

                        </span>


                        <div>

                          <strong>

                            {
                              activeCategory ===
                              "sessions"

                                ? "Focus Session"

                                : getWebsite(
                                    record
                                  )
                            }

                          </strong>


                          <span>
                            {
                              formatDate(
                                record
                              )
                            }
                          </span>

                        </div>

                      </div>


                      <span className="source-tag">
                        🟢 Auto-tracked
                      </span>

                    </div>


                    {/* DETAILS */}

                    <div className="record-details">


                      {activeCategory ===
                        "sessions" && (

                        <>

                          <div>

                            <span>
                              Duration
                            </span>

                            <strong>
                              {
                                getDuration(
                                  record
                                )
                              }{" "}
                              min
                            </strong>

                          </div>


                          <div>

                            <span>
                              Target
                            </span>

                            <strong>
                              {
                                record.target_minutes ||
                                "—"
                              }{" "}
                              min
                            </strong>

                          </div>


                          <div>

                            <span>
                              Status
                            </span>

                            <strong>
                              {
                                record.status ||
                                "Recorded"
                              }
                            </strong>

                          </div>

                        </>

                      )}


                      {activeCategory ===
                        "usage" && (

                        <>

                          <div>

                            <span>
                              Website / App
                            </span>

                            <strong>
                              {
                                getWebsite(
                                  record
                                )
                              }
                            </strong>

                          </div>


                          <div>

                            <span>
                              Duration
                            </span>

                            <strong>
                              {
                                getDuration(
                                  record
                                )
                              }{" "}
                              min
                            </strong>

                          </div>


                          <div>

                            <span>
                              Switches
                            </span>

                            <strong>
                              {
                                getSwitchCount(
                                  record
                                )
                              }
                            </strong>

                          </div>


                          <div>

                            <span>
                              Productivity
                            </span>

                            <strong>
                              {
                                getProductivity(
                                  record
                                )
                              }
                            </strong>

                          </div>

                        </>

                      )}


                      {activeCategory ===
                        "distractions" && (

                        <>

                          <div>

                            <span>
                              Activity
                            </span>

                            <strong>
                              {
                                getWebsite(
                                  record
                                )
                              }
                            </strong>

                          </div>


                          <div>

                            <span>
                              Duration
                            </span>

                            <strong>
                              {
                                getDuration(
                                  record
                                )
                              }{" "}
                              min
                            </strong>

                          </div>


                          <div>

                            <span>
                              Switches
                            </span>

                            <strong>
                              {
                                getSwitchCount(
                                  record
                                )
                              }
                            </strong>

                          </div>

                        </>

                      )}


                      {activeCategory ===
                        "productivity" && (

                        <>

                          <div>

                            <span>
                              Activity
                            </span>

                            <strong>
                              {
                                getWebsite(
                                  record
                                )
                              }
                            </strong>

                          </div>


                          <div>

                            <span>
                              Classification
                            </span>

                            <strong>
                              {
                                getProductivity(
                                  record
                                )
                              }
                            </strong>

                          </div>


                          <div>

                            <span>
                              Duration
                            </span>

                            <strong>
                              {
                                getDuration(
                                  record
                                )
                              }{" "}
                              min
                            </strong>

                          </div>

                        </>

                      )}

                    </div>


                    {/* EXPLANATION */}

                    <div className="record-explanation">

                      💡{" "}

                      {
                        getExplanation(
                          record
                        )
                      }

                    </div>


                    {/* ACTIONS */}

                    <div className="record-actions">

                      <button
                        onClick={() =>
                          flagRecord()
                        }
                      >
                        🚩 Flag inaccurate
                      </button>


                      <button
                        onClick={() =>
                          deleteRecord(
                            record
                          )
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* PRIVACY */}

        <section className="privacy-footer-card">

          <div>

            <strong>
              🔒 Your privacy matters
            </strong>

            <p>
              This page displays
              the activity data
              associated with your
              FocusGuard account.
            </p>

          </div>


          <button
            onClick={() =>
              window.alert(
                "Privacy Policy page can be connected here."
              )
            }
          >
            View Privacy Policy →
          </button>

        </section>


        {/* DOWNLOAD AT BOTTOM */}

        <section className="explore-card download-bottom-card">

          <div>

            <h2>
              📥 Download My Data
            </h2>

            <p>
              Download a copy of
              the data shown in
              Explore My Data.
            </p>

          </div>


          <button
            className="explore-export-button"
            onClick={() =>
              setShowExport(true)
            }
          >
            Download My Data
          </button>

        </section>


      </main>


      {/* EXPORT MODAL */}

      {showExport && (

        <div
          className="export-overlay"
          onClick={() =>
            setShowExport(false)
          }
        >

          <div
            className="export-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setShowExport(false)
              }
            >
              ×
            </button>


            <div className="modal-icon">
              📥
            </div>


            <h2>
              Download My Data
            </h2>


            <p>
              Download your actual
              FocusGuard activity data.
            </p>


            <div className="export-info">

              <span>
                ✓ Focus session logs
              </span>

              <span>
                ✓ App & site usage
              </span>

              <span>
                ✓ Distraction events
              </span>

              <span>
                ✓ Productivity records
              </span>

            </div>


            <h3>
              Choose format
            </h3>


            <div className="format-options">


              <button
                className={
                  exportFormat ===
                  "json"
                    ? "format-option selected"
                    : "format-option"
                }

                onClick={() =>
                  setExportFormat(
                    "json"
                  )
                }
              >

                <strong>
                  JSON
                </strong>

                <span>
                  Best for backup
                </span>

              </button>


              <button
                className={
                  exportFormat ===
                  "csv"
                    ? "format-option selected"
                    : "format-option"
                }

                onClick={() =>
                  setExportFormat(
                    "csv"
                  )
                }
              >

                <strong>
                  CSV
                </strong>

                <span>
                  Best for Excel
                </span>

              </button>


            </div>


            <div className="modal-actions">

              <button
                className="modal-cancel"
                onClick={() =>
                  setShowExport(false)
                }
              >
                Cancel
              </button>


              <button
                className="modal-download"
                onClick={
                  handleDownload
                }
              >
                📥 Download{" "}
                {
                  exportFormat.toUpperCase()
                }
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default ExploreMyData;