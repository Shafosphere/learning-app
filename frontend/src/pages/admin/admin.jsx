import "./admin.css";
import AdminSidebar from "../../components/admin/admin-sidebar/admin-sidebar";
import ReportsPanel from "../../components/admin/panel-reports/panel-reports";
export default function AdminPanel(){
    return(
        <div className="container-admin">
            <AdminSidebar/>
            <ReportsPanel/>
        </div>
    )
}