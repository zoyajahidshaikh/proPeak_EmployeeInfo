import React, { Component } from "react";
import DataTable from "../../../Components/datatable";
import config from "../../../common/config";
import { Link } from "react-router-dom";
import * as leaveApplicationService from "../../../Services/leave-service/leave-service";
import Auth from "../../../utils/auth";
// import FullCalendar from 'fullcalendar-reactwrapper';
import FullCalendar from "fullcalendar-reactwrapper";
import "./leave.css";

class LeaveList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leaveApplication: {},
      isLoaded: false,
      leaveDetails: {},
      leaveId: this.props.leaveId || null, // Handle absence of leaveId prop
      errorMessage: "",
      successMessage: "",
      checked: "",
      startDate: "", // Consider setting default values if needed
      endDate: "", // Consider setting default values if needed
      appliedLeaveheaders: [
        // Define your headers here
      ],
      userAppliedLeaveheaders: [
        // Define your headers here
      ],
      appliedLeave: [],
      appliedLeaveByUsers: [],
      allappliedleave: [],
      calendarData: [],
      selectedView: "DatatableView",
    };

    this.onSelectViewChange = this.onSelectViewChange.bind(this);
  }
  handleInputChange = (event) => {
    // Update state when form fields change
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };
//   handleSubmit = async (event) => {
//     event.preventDefault();
//     try {
//       // Create a data object from form fields in state
//       const leaveData = {
//         startDate: this.state.startDate,
//         endDate: this.state.endDate,
//         // Include other form fields...
//       };
  
//       // Send data to the server using leaveApplicationService instead of leaveService
//       const response = await leaveApplicationService.createLeave(leaveData);
  
//       // Handle success response
//       console.log("Leave created:", response);
  
//       // Optionally, reset the form fields after submission
//       this.setState({
//         startDate: "",
//         endDate: "",
//         // Reset other form fields...
//       });
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       // Handle error state appropriately
//     }
//   };
  renderActionCell(row) {
    // This method defines how the action cells should be rendered in the DataTable.
    // Customize the content and appearance of action cells based on the provided 'row' data.
    // You can add buttons, icons, or any other UI elements to represent actions.
    // Make sure to handle the desired actions, such as deletion or approval, within this logic.
    // If needed, you can access other components or external functions to perform specific actions.
    // Ensure that the rendered JSX aligns with your application's design and functionality.
    // Modify this method according to your specific requirements for handling actions in the DataTable.
  }

  async onDeleteListId(leaveId) {
    try {
      await leaveApplicationService.deleteLeave(leaveId);
      this.updateAppliedLeaveState(leaveId);
    } catch (error) {
      console.error("Error deleting leave:", error);
    }
  }

  async onRejectListId(leaveId) {
    try {
      await this.getDetails(leaveId, "rejected");
      let leaveApprovedReject = this.createLeaveApprovedReject(leaveId);

      await this.postApproveReject(leaveApprovedReject);

      this.updateLeaveStatus(leaveId, "Rejected");
    } catch (error) {
      console.error("Error rejecting leave:", error);
    }
  }

  async onApproveListId(leaveId) {
    try {
      await this.getDetails(leaveId, "approved");
      let leaveApprovedReject = this.createLeaveApprovedReject(leaveId);

      await this.postApproveReject(leaveApprovedReject);

      this.updateLeaveStatus(leaveId, "Approved");
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  }

  async getDetails(leaveId, approverejected) {
    try {
      let { response } = await leaveApplicationService.getDetails(leaveId);

      if (approverejected === "rejected") {
        response.data.leaveDetails.status = "rejected";
      } else {
        response.data.leaveDetails.status = "approved";
      }

      this.setState({
        isLoaded: false,
        leaveDetails: response.data.leaveDetails,
        acceptReject: response.data.leaveDetails.status,
        reason: response.data.leaveDetails.rejectionReason,
      });
    } catch (error) {
      console.error("Error fetching details:", error);
      this.setState({
        isLoaded: false,
      });
    }
  }

  async postApproveReject(leaveApprovedReject) {
    try {
      let { response } = await leaveApplicationService.ApprovedReject(
        leaveApprovedReject
      );

      if (response && response.data.err) {
        this.setState({
          ...this.state,
          errorMessage: response.data.err,
        });
      } else {
        this.setState({
          successMessage: response.data.message,
        });
      }
    } catch (error) {
      console.error("Error approving/rejecting leave:", error);
      this.setState({
        ...this.state,
        errorMessage: "An error occurred while processing your request.",
      });
    }
  }

  createLeaveApprovedReject(leaveId) {
    return {
      approvedRejected: this.state.acceptReject,
      leaveId: leaveId,
      reasonRejection: this.state.reason,
      modifiedBy: Auth.get("userId"),
      modifiedOn: new Date(),
      toEmail: this.state.leaveDetails.fromEmail,
      leaveWithoutApproval: this.state.leaveDetails.leaveWithoutApproval,
    };
  }

  updateLeaveStatus(leaveId, status) {
    let appliedLeave = this.state.appliedLeave.map((al) => {
      if (al.leaveId === leaveId) {
        al.status = status;
      }
      return al;
    });

    let appliedLeaveByUsers = this.state.appliedLeaveByUsers.map((al) => {
      if (al.leaveId === leaveId) {
        al.status = status;
      }
      return al;
    });

    this.setState({
      appliedLeave: appliedLeave,
      appliedLeaveByUsers: appliedLeaveByUsers,
    });
  }

  updateAppliedLeaveState(leaveId) {
    let appliedLeave = this.state.appliedLeave.filter(
      (al) => al.leaveId !== leaveId
    );
    let appliedLeaveByUsers = this.state.appliedLeaveByUsers.filter(
      (al) => al.leaveId !== leaveId
    );

    this.setState({
      appliedLeave: appliedLeave,
      appliedLeaveByUsers: appliedLeaveByUsers,
    });
  }

  // componentDidMount() {
  //     this.setAppliedLeaves('applied');
  //     if (this.state.calendarData.length === 0) {
  //         this.getAllLeavesForCalendar();
  //     }
  // }
  componentDidMount() {
    this.setAppliedLeaves("applied");
    if (this.state.calendarData.length === 0) {
      this.getAllLeavesForCalendar();
    }
    if (!this.state.appliedLeave) {
      this.setState({ appliedLeave: [] });
    }
    if (!this.state.appliedLeaveByUsers) {
      this.setState({ appliedLeaveByUsers: [] });
    }
  }

  async getAllLeavesForCalendar() {
    try {
      let { response } =
        await leaveApplicationService.getAllLeavesForCalendar();

      if (response.data.result.length > 0) {
        this.setState({
          isLoaded: false,
          calendarData: response.data.result,
        });
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      this.setState({
        isLoaded: false,
      });
    }
  }

  async setAppliedLeaves(flag) {
    try {
      let { response } = await leaveApplicationService.getAllAppliedLeaves(
        flag
      );
      let role = Auth.get("userRole");

      if (role === "user" && response.data.appliedLeaves.length > 0) {
        this.setState({
          appliedLeave: response.data.appliedLeaves,
          isLoaded: false,
        });
      } else if (response.data) {
        this.setState({
          appliedLeave: response.data.appliedLeaves,
          appliedLeaveByUsers: response.data.userAppliedLeaves,
          isLoaded: false,
        });
      }
    } catch (error) {
      console.error("Error setting applied leaves:", error);
      this.setState({
        isLoaded: false,
        // Handle error state appropriately
      });
    }
  }

  async getAllAppliedLeavesforAdmin() {
    try {
      let { response } =
        await leaveApplicationService.getAllAppliedLeavesforAdmin();

      if (response.data) {
        this.setState({
          appliedLeaveByUsers: response.data,
          appliedLeave: [],
          isLoaded: false,
        });
      }
    } catch (error) {
      console.error("Error getting all applied leaves for admin:", error);
      this.setState({
        isLoaded: false,
        // Handle error state appropriately
      });
    }
  }
  onSelectViewChange(e) {
    let selectedView = e.target.value;
    this.setState({
      selectedView: selectedView,
    });
  }
  render() {
    let viewList = window.propeakConfigData.calenderViews.map((module, i) => {
      return (
        <option value={module.id} key={module.id}>
          {module.desc}
        </option>
      );
    });
    const dataTable = (
      <DataTable
        className="data-table"
        title=""
        keyField="_id"
        pagination={{
          enabled: true,
          pageLength: 50,
          type: "long",
        }}
        width="100%"
        headers={
          this.state.appliedLeave && this.state.appliedLeave.length > 0
            ? this.state.appliedLeaveheaders
            : this.state.userAppliedLeaveheaders
        }
        data={
          this.state.appliedLeave && this.state.appliedLeave.length > 0
            ? this.state.appliedLeave
            : this.state.appliedLeaveByUsers &&
              this.state.appliedLeaveByUsers.length > 0
            ? this.state.appliedLeaveByUsers
            : []
        }
        hightlightRow={this.state.hightlightRow}
        noData="No records!"
        show={config.Export}
      />
    );

    return (
      <React.Fragment>
        <div className="container bg-white">
          {this.state.isLoaded ? (
            <div className="logo">
              <img src="/images/loading.svg" alt="loading" />
            </div>
          ) : (
            <div>
              <div className="row">
                <div className="col">
                  <h4 className="project-total mt-2">
                    Leaves &nbsp;
                    {Auth.get("userRole") !== "support" ? (
                      <span title="apply leave">
                        <Link
                          to={"/leave/create"}
                          className="links "
                          style={{
                            lineHeight: "1.3em",
                            color: "rgb(255, 152, 0)",
                            fontSize: "20px",
                          }}
                        >
                          <i className="fas fa-plus"></i>
                        </Link>
                      </span>
                    ) : (
                      ""
                    )}
                  </h4>
                </div>
              </div>
              <div className="row">
                {this.state.selectedView === "calendarView" ? (
                  <div className="col-sm-10"></div>
                ) : (
                  <div className="col-sm-10">
                    <nav>
                      <div
                        className="nav nav-tabs nav-fill"
                        id="pills-tab"
                        role="tablist"
                      >
                        <a
                          onClick={this.setAppliedLeaves.bind(this, "applied")}
                          className="nav-link active"
                          id="applied-tab"
                          data-toggle="pill"
                          href="#applied"
                          role="tab"
                          aria-controls="applied"
                          aria-selected="true"
                        >
                          Applied Leaves
                        </a>
                        {Auth.get("userRole") !== "user" ? (
                          <a
                            onClick={this.setAppliedLeaves.bind(
                              this,
                              "pending"
                            )}
                            className="nav-link"
                            id="pending-tab"
                            data-toggle="pill"
                            href="#pending"
                            role="tab"
                            aria-controls="pending"
                            aria-selected="false"
                          >
                            Pending Leaves
                          </a>
                        ) : (
                          ""
                        )}
                        {Auth.get("userRole") !== "user" ? (
                          <a
                            onClick={this.setAppliedLeaves.bind(this, "all")}
                            className="nav-link"
                            id="all-leaves-tab"
                            data-toggle="pill"
                            href="#all-leaves"
                            role="tabpanel"
                            aria-controls="all-leaves"
                            aria-selected="false"
                          >
                            Leaves Applied By Users
                          </a>
                        ) : (
                          ""
                        )}
                        {Auth.get("userRole") === "admin" ||
                        Auth.get("userRole") === "support" ? (
                          <a
                            onClick={this.getAllAppliedLeavesforAdmin.bind(
                              this
                            )}
                            className="nav-link"
                            id="all-user-leaves-tab"
                            data-toggle="pill"
                            href="#all-user-leaves"
                            role="tabpanel"
                            aria-controls="all-leaves"
                            aria-selected="false"
                          >
                            All Leaves Applied By Users
                          </a>
                        ) : (
                          ""
                        )}
                      </div>
                    </nav>
                  </div>
                )}
                <div className="col-sm-2">
                  <div className="float-right">
                    <div className="input-group input-group-sm ">
                      <div className="input-group-prepend">
                        <span
                          className="input-group-text rounded-0"
                          id="inputGroup-sizing-sm"
                        >
                          <i className="far fa-eye"></i>
                        </span>
                      </div>
                      <select
                        style={{ fontSize: "11px" }}
                        className="form-control"
                        onChange={this.onSelectViewChange}
                        value={this.state.selectedView}
                        placeholder="Select View"
                      >
                        {viewList}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div id="largeCalendar">
                  {this.state.selectedView === "calendarView" ? (
                    <FullCalendar
                      header={{
                        left: "prev,next today myCustomButton",
                        center: "title",
                        right: "month,basicWeek,basicDay",
                      }}
                      defaultDate={new Date()}
                      navLinks={true}
                      editable={true}
                      eventLimit={true}
                      events={
                        this.state.calendarData ? this.state.calendarData : []
                      }
                    />
                  ) : (
                    <div className="leave-div">
                      <h3 className="project-title d.inline-block mt-3">
                        Leave Status
                      </h3>
                      <div
                        className="tab-content leave-table"
                        id="pills-tabContent"
                      >
                        <div
                          className="tab-pane fade show active"
                          id="applied"
                          role="tabpanel"
                          aria-labelledby="applied-tab"
                        >
                          {" "}
                          {dataTable}
                        </div>
                        <div
                          className="tab-pane fade"
                          id="pending"
                          role="tabpanel"
                          aria-labelledby="pending-tab"
                        >
                          {dataTable}
                        </div>
                        <div
                          className="tab-pane fade"
                          id="all-leaves"
                          role="tabpanel"
                          aria-labelledby="all-leaves-tab"
                        >
                          {dataTable}
                        </div>
                        <div
                          className="tab-pane fade"
                          id="all-user-leaves"
                          role="tabpanel"
                          aria-labelledby="all-user-leaves-tab"
                        >
                          {dataTable}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}
export default LeaveList;
