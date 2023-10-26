import React, { Component, lazy, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import './app.css';
import './theme.css';
import { Consumer } from './re-stated';
import PMSProvider from './providers/pms-provider';
import PrivateRoute from './features/private-route/private-route';
// import AlgoLoadable from './Components/loadable/loadable';
// import SuspenseWrapper from './Components/suspense/suspense-wrapper';
import ErrorBoundary from './Components/error-boundary';

import Menu from './features/menu';


const ResetPassword = lazy(() => import('./features/login/components/reset-password'));

const ProjectMain = lazy(() => import('./features/project/project-main'));

const ProjectForm = lazy(() => import('./features/project/project-form'));

const TaskForm = lazy(() => import('./features/tasks/task-form'));

const TaskMain = lazy(() => import('./features/tasks/task-main'));

const Company = lazy(() => import('./features/company/company'));

const AccessRights = lazy(() => import('./features/access-rights/access-rights'));

const CategorySortOrder = lazy(() => import('./features/categorySortOrder/categorySortOrder'));

const Chat = lazy(() => import('./features/chat/chat'));

const ChatMain = lazy(() => import('./features/chat/chat-main'));

const FavoriteProjectList = lazy(() => import('./features/favorite-projects/favorite-projectlist'));

const Groups = lazy(() => import('./features/groups/groups'));

const User = lazy(() => import('./features/user/user'));

const ChangePassword = lazy(() => import('./features/login/components/change-password'));

const ResetForgotPassword = lazy(() => import('./features/login/components/reset-forgot-password'));

const Summary = lazy(() => import('./features/summary/summary'));

const Login = lazy(() => import('./features/login/components/login'));

const Logout = lazy(() => import('./features/login/components/logout'));

const Category = lazy(() => import('./features/category/category'));

const Header = lazy(() => import('./features/header'));

const Footer = lazy(() => import('./features/footer'));

const AuditLog = lazy(() => import('./features/audit-log/audit-log'));

const TaskReport = lazy(() => import('./features/reports/task-report'));

const UserReport = lazy(() => import('./features/reports/user-report'));

const ActiveUserReport = lazy(() => import('./features/reports/active-users-report'));

const TasksUpload = lazy(() => import('./features/tasks/tasks-upload'));

const ProjectSummary = lazy(() => import('./features/project/project-summary'));

const Notification = lazy(() => import('./features/notification/notification'));

const NotificationForm = lazy(() => import('./features/notification/notification-form'));

const NotificationDisplay = lazy(() => import('./features/notification/notification-display'));

const UserChatForm = lazy(() => import('./features/user-chat/user-chat-form'));

const LeaveList = lazy(() => import('./features/leave/components/leave-list'));

const LeaveApplication = lazy(() => import('./features/leave/components/leave-application'));

const LeaveDetails = lazy(() => import('./features/leave/components/leave-details'));

const AppLevelAccessRight = lazy(() => import('./Components/Entitlement/components/applevelaccessrights'));

const UserTaskCountReport = lazy(() => import('./features/reports/user-task-count-report'));

const IncompeleteTaskCountReport = lazy(() => import('./features/reports/incompelete_task_count-report'));

const ProjectProgressReport = lazy(() => import('./features/reports/project-progress-report'));

const ProfilePicture = lazy(() => import('./features/upload-file/upload-profile'));

const UserPerformanceReport = lazy(() => import('./features/reports/user-performance-reports'));

const GlobalRepositoryMain = lazy(() => import('./features/global-level-repository/components/global-level-repository-main'));

const GlobalRepositoryForm = lazy(() => import('./features/global-level-repository/components/global-level-repository-form'));

const ReportMenu = lazy(() => import('./features/reports/report-menu'));


class App extends Component {

    render() {
        // whyDidYouUpdate(React);
        return (
            <PMSProvider>
                <ErrorBoundary>
                    <Suspense fallback={
                        <div className="logo" >
                            <img src="/images/loading.svg" alt="loading" />
                        </div >}>
                        <Switch>
                            <Route path="/login" render={(props) => <Login {...props} />} />
                            <Route path="/users/reset/" render={(props) => <ResetPassword {...props} />} />
                            <Route exact path='/resetPassword' render={(props) => <ResetForgotPassword {...props} />} />
                            <Route path='/Logout' render={() => <Logout />} />

                            <PrivateRoute path="/" render={(props) => (
                                <div className="page-container">
                                    <Menu />
                                    <div className="page" >
                                        <Consumer>{
                                            (context) => (<Header {...props} context={context} />)}</Consumer>

                                            <Consumer>{
                                                (context) => (<NotificationDisplay context={context} />)}</Consumer>
                                            <Route exact path="/leave" render={(props) => <Consumer>
                                                {
                                                    (context) => (<LeaveList context={context} />)
                                                }
                                            </Consumer>} />
                                            <Route exact path="/leave/create" render={(props) => <Consumer>
                                                {
                                                    (context) => (<LeaveApplication context={context} />)
                                                }
                                            </Consumer>} />
                                            <Route exact path="/leave-edit/:leaveId" render={(props) => <Consumer>
                                                {
                                                    (context) => (<LeaveApplication context={context} leaveId={props.match.params.leaveId} />)
                                                }
                                            </Consumer>} />
                                            <Route exact path="/leave-details/:leaveId" render={(props) => <Consumer>
                                                {
                                                    (context) => (<LeaveDetails context={context} leaveId={props.match.params.leaveId} />)
                                                }
                                            </Consumer>} />
                                            <Route exact path="/projects" render={(props) => <Consumer>{
                                                (context) => (
                                                    <ProjectMain context={context} />
                                                )}</Consumer>} />
                                            <Route exact path="/projects/:id" render={(props) => <Consumer>{
                                                (context) => (
                                                    <ProjectMain context={context} userId={props.match.params.id} />
                                                )}</Consumer>} />
                                            <Route exact path="/project/create" render={(props) => <Consumer>{
                                                (context) => (<ProjectForm context={context} />)}</Consumer>} />
                                            <Route exact path="/project/edit/:id" render={(props) => <Consumer>{
                                                (context) => (<ProjectForm context={context} projectId={props.match.params.id} />)}</Consumer>} />
                                            <Route path='/project/tasks/:id' render={(props) => <Consumer>{
                                                (context) => (<TaskMain context={context} projectId={props.match.params.id} />)}</Consumer>} />
                                            <Route path='/project/user/tasks/:userId/:id' render={(props) => <Consumer>{
                                                (context) => (<TaskMain context={context} projectId={props.match.params.id} userId={props.match.params.userId} />)}</Consumer>} />

                                            <Route exact path="/project/task/edit/:projectId/:id" render={(props) => <Consumer>{
                                                (context) => (<TaskForm context={context} taskParamsId={props.match.params.id} projectParamsId={props.match.params.projectId} />)}</Consumer>} />

                                            <Route exact path="/project/task/edit/:projectId/:id/messages" render={(props) => <Consumer>{
                                                (context) => (<TaskForm context={context} taskParamsId={props.match.params.id} projectParamsId={props.match.params.projectId} paramsMessages={'messagesTab'} />)}</Consumer>} />

                                            <Route path='/project/taskReport/:id' render={(props) => <Consumer>{
                                                (context) => (
                                                    <TaskReport context={context} projectId={props.match.params.id} />
                                                )}</Consumer>} />
                                            <Route path='/uploadTasks/:id' render={(props) => <Consumer>{
                                                (context) => (<TasksUpload context={context} projectId={props.match.params.id} />)}</Consumer>} />
                                            <Route path='/projectUsers/:id' render={(props) => <Consumer>{
                                                (context) => (<ProjectSummary context={context} projectId={props.match.params.id} />)}</Consumer>} />
                                            <Route path='/auditReport/:id' render={(props) => <Consumer>{
                                                (context) => (<AuditLog context={context} projectId={props.match.params.id} />)}</Consumer>} />
                                            <Route exact path="/users" render={(props) => <Consumer>{
                                                (context) => (<User context={context} />)}</Consumer>} />

                                            <Route exact path="/changePassword" render={(props) => <ChangePassword {...props} />} />

                                            <Route exact path="/Logout" render={(props) => <Logout {...props} />} />

                                            <Route path='/taskReports' render={(props) => <Consumer>{
                                                (context) => (
                                                    <React.Fragment>
                                                        <div className="container bg-white">
                                                            <ReportMenu key="RM" />
                                                            <TaskReport context={context} />
                                                        </div>
                                                    </React.Fragment>)}</Consumer>} />

                                            <Route path='/userReports' render={(props) => <Consumer>{
                                                (context) => (
                                                    <React.Fragment>
                                                        <div className="container bg-white">
                                                            <ReportMenu key="RM" />
                                                            <UserReport context={context} />
                                                        </div>
                                                    </React.Fragment>)}</Consumer>} />
                                            <Route path='/project/userReport/:id' render={(props) => <Consumer>{
                                                (context) => (
                                                    <UserReport context={context} projectId={props.match.params.id} />)}</Consumer>} />

                                            <Route path='/activeUsers' render={(props) => <Consumer>{
                                                (context) => (
                                                    <React.Fragment>
                                                        <div className="container bg-white">
                                                            <ReportMenu key="RM" />
                                                            <ActiveUserReport context={context} />
                                                        </div>
                                                    </React.Fragment>)}</Consumer>} />

                                            <Route path='/incompeleteTaskReports' render={(props) => <Consumer>{
                                                (context) => (
                                                    <React.Fragment>
                                                        <div className="container bg-white">
                                                            <ReportMenu key="RM" />
                                                            <IncompeleteTaskCountReport context={context} />
                                                        </div>
                                                    </React.Fragment>)}</Consumer>} />

                                            <Route path='/userTaskReports' render={(props) => <Consumer>{
                                                (context) => (
                                                    <React.Fragment>
                                                        <div className="container bg-white">
                                                            <ReportMenu key="RM" />
                                                            <UserTaskCountReport context={context} />
                                                        </div>
                                                    </React.Fragment>
                                                )}</Consumer>} />

                                            <Route exact path="/projectProgressReports/" render={(props) => <Consumer>{
                                                (context) => (
                                                    <React.Fragment>
                                                        <div className="container bg-white">
                                                            <ReportMenu key="RM" />
                                                            <ProjectProgressReport context={context} />
                                                        </div>
                                                    </React.Fragment>)}</Consumer>} />

                                            <Route exact path='/userPerformanceReports' render={(props) => <Consumer>{
                                                (context) => (
                                                    <React.Fragment>
                                                        <div className="container bg-white">
                                                            <ReportMenu key="RM" />
                                                            <UserPerformanceReport context={context} />
                                                        </div>
                                                    </React.Fragment>)}</Consumer>} />

                                            <Route exact path='/userPerformanceReports/:userId' render={(props) => <Consumer>{
                                                (context) => (<UserPerformanceReport context={context} userId={props.match.params.userId} />)}</Consumer>} />


                                            <Route exact path="/" render={(props) => <Consumer>{
                                                (context) => (<Summary context={context} />)}</Consumer>} />

                                            <Route exact path='/category' render={(props) => <Consumer>{
                                                (context) => (<Category context={context} />)}</Consumer>} />

                                            <Route exact path='/discussionBoard' render={(props) => <Consumer>{
                                                (context) => (<Chat context={context} />)}</Consumer>} />
                                            <Route exact path='/discussionBoard/:id' render={(props) => <Consumer>{
                                                (context) => (<ChatMain context={context} subjectId={props.match.params.id} />)}</Consumer>} />
                                            <Route exact path='/discussionBoard/project/:id' render={(props) => <Consumer>{
                                                (context) => (<Chat context={context} projectId={props.match.params.id} />)}</Consumer>} />
                                            <Route exact path='/discussionBoard/project/:projectId/:subjectId' render={(props) => <Consumer>{
                                                (context) => (<ChatMain context={context} projectId={props.match.params.projectId} subjectId={props.match.params.subjectId} />)}</Consumer>} />

                                            <Route exact path='/company' render={(props) => <Consumer>{
                                                (context) => (<Company context={context} />)}</Consumer>} />


                                            <Route exact path="/projects/favorites/Projectlist" render={(props) => <Consumer>{
                                                (context) => (<ProjectMain context={context} />)}</Consumer>} />

                                            <Route exact path="/groups" render={(props) => <Consumer>{
                                                (context) => (<Groups context={context} />)}</Consumer>} />

                                            <Route exact path='/project/accessRights/:id' render={(props) => <Consumer>{
                                                (context) => (<AccessRights context={context} projectId={props.match.params.id} />)}</Consumer>} />

                                            <Route exact path='/project/categorySortOrder/:id' render={(props) => <Consumer>{
                                                (context) => (<CategorySortOrder context={context} projectId={props.match.params.id} />)}</Consumer>} />

                                            <Route exact path='/notification/:id' render={(props) => <Consumer>{
                                                (context) => (<Notification context={context} projectId={props.match.params.id} />)}</Consumer>} />

                                            <Route exact path='/notification/create/notification/:projectId' render={(props) => <Consumer>{
                                                (context) => (<NotificationForm context={context} projectId={props.match.params.projectId} />)}</Consumer>} />

                                            <Route exact path='/notification/:projectId/create/notification' render={(props) => <Consumer>{
                                                (context) => (<NotificationForm context={context} projectId={props.match.params.projectId} />)}</Consumer>} />

                                            <Route exact path='/notification/edit/notification/:id/:projectId' render={(props) => <Consumer>{
                                                (context) => (<NotificationForm context={context} notificationId={props.match.params.id} projectId={props.match.params.projectId} />)}</Consumer>} />

                                            <Route exact path="/chat" render={(props) => <Consumer>{
                                                (context) => (<UserChatForm context={context} />)}</Consumer>} />

                                            <Route exact path="/applevelaccessright/" render={(props) => <Consumer>{
                                                (context) => (<AppLevelAccessRight context={context} />)}</Consumer>} />

                                            <Route exact path="/profilePicture" render={(props) => <ProfilePicture {...props} />} />

                                            <Route exact path="/globalrepository" render={(props) => <Consumer>{
                                                (context) => (<GlobalRepositoryMain context={context} />)}</Consumer>} />

                                            <Route exact path="/globalrepository/create/:pathValue" render={(props) => <Consumer>{
                                                (context) => (<GlobalRepositoryForm context={context} pathValue={props.match.params.pathValue} />)}</Consumer>} />

                                            <Route exact path="/globalrepository/edit/:id" render={(props) => <Consumer>{
                                                (context) => (<GlobalRepositoryForm context={context} fileId={props.match.params.id} />)}</Consumer>} />
                                    </div>

                                    {/* <Footer {...props} /> */}
                                </div>
                            )}>
                            </PrivateRoute>
                        </Switch>
                    </Suspense>
                </ErrorBoundary>
            </PMSProvider>
        )
    }
    // }
}

export default App;
