import Hero from "./Components/Hero";
import Navbar from "./Components/Navbar";
import BoxCricketDashboard from "../src/Components/BoxCricketDashboard"
import { Route,Routes } from "react-router-dom";
import { QueryClientProvider ,QueryClient} from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Turfs from "./Pages/Turfs";
import TurfDetails from "./Pages/TurfDetails";
import Index from "./Pages/Index";
import NotFound from "./Pages/Notfound";
import Booking from "./Pages/Booking"
import MyBookings from "./Pages/MyBookings";
import Singup from "./Pages/SignupForm";
import LoginForm from "./Pages/LoginForm";
import Group from "./Pages/Group";
import GroupDashboard from "./Pages/GroupDashboard";
import Invitations from "./Pages/Invitations";
import MyGroups from "./Pages/MyGroups";
import GroupDetail from "./Pages/GroupDetail";
import RegisterVenue from "./Pages/RegisterVenue";
import ProfileSection from "./Pages/ProfileSection";
import CompleteProfile from "./Pages/CompleteProfile";
// import Signup from "./Admin/pages/Signup"
import Login from "./Pages/Login";
import Signup from "./Pages/SignupForm";
// import TurfManagement from "./Admin/pages/TurfManagement";
// import DashboardContent from "./Admin/components/DashboardContent";
function App() {
  const queryClient = new QueryClient();
  return (
  <QueryClientProvider client={queryClient}>
    
      <Sonner />
        <Routes>
         <Route path="/" element={<Index />} />
            <Route path="/turfs" element={<Turfs />} />
            <Route path="/turf/:id" element={<TurfDetails />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/create-group" element={<Group/>}/>
            <Route path="/group/:groupId" element={<GroupDashboard/>}/>
        <Route path="/invitations" element={<Invitations />} />
         <Route path="/my-groups" element={<MyGroups />} />
         <Route path="/complete-profile" element={<CompleteProfile/>}/>
{/* <Route path="/group/:id" element={<GroupDetail />} /> */}
<Route path="/register-venue" element={<RegisterVenue/>}/>
<Route path="/profile-section" element={<ProfileSection/>}/>
{/* <Route path="/admin-signup" element={<Signup/>}/> */}

        </Routes>
 
    
  </QueryClientProvider>
  );
}

export default App;
