import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Settings, Check, X, 
  Wallet, Filter, Search, Calendar, 
  Loader2, Ban, UserPlus, Crown,Bell
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from 'sonner';
import axios from 'axios';
// import AddExpenseModal from './AddExpenseModal';

import Headers from "../component/Headers";
import Footer from "../component/Footer";
import { routes } from '../../routes.js';

const GroupDashboard = () => {
  const navigate = useNavigate();
  const { groupId } = useParams(); // Get ID from URL
  console.log(groupId);
  
  const token = localStorage.getItem('UserCricBoxToken');
  const currentUserId = localStorage.getItem('UserId'); // Assuming you store this on login
  // const groupId=localStorage.getItem("GroupId")

  // --- STATE ---
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activity");
  
  
// State for the Settle Modal
const [isSettleOpen, setIsSettleOpen] = useState(false);
const [settleStep, setSettleStep] = useState('input'); // 'input' | 'success'
const [amountToPay, setAmountToPay] = useState(0);
// Modal States
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberNick, setNewMemberNick] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // Settle Up Logic State
  // const [settleStep, setSettleStep] = useState('input'); 
  // const [amountToPay, setAmountToPay] = useState(0);

  //expense modal for the expense creation
  const[open,setOpen]=useState(false)

  //payment settlement logic
  const[paymentData,setPaymentData]=useState(null);
  const[settlementdata,setsettlementdata]=useState(null);
  const[mysettlement,setmysettlement]=useState(null);


  //payment new logic 
  const [isModalOpen, setIsModalOpen] = useState(false);
const [paymentDatas, setPaymentDatas] = useState({
  settlementId: "",
  amount: "",
  maxAmount: 0,
  paymentMethod: "UPI"
});

// const [settlePaymentMethod, setSettlePaymentMethod] = useState("UPI");



// const processPayment = async () => {
//   if (!amountToPay || amountToPay <= 0) return;
  
//   try {
//    // Adjust based on where you store token
    
//     // Assuming 'mysettlement' contains the settlementId you need
//     // or use groupData.activeSettlementId depending on your data structure
//     // const settlementId = mysettlement.settlementId || groupData.activeSettlementId; 
//  const settlementId = settlementdata?.settlement
// ?._id ;
//  console.log("hello panipuri data..........",settlementdata);
 
//     console.log("hello manchuriyan.......",settlementId);
//    const resposne= await axios.post(
//       `http://localhost:5000/api/settlement/${settlementId}/payment`,
//       {
//         amount: Number(amountToPay),
//         paymentMethod: "UPI" // You can add a selector for this if needed
//       },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//    console.log("dosa........ taiyar haih .....",resposne);
   
//     setSettleStep('success');
    
//     // Optional: Auto close after 2 seconds
//     setTimeout(() => {
//       setIsSettleOpen(false);
//       setSettleStep('input');
//       setAmountToPay('');
//       // fetchGroupData(); // Call your refresh function here
//     }, 2000);

//   } catch (error) {
//     console.error("Payment Error", error);
//     // Add toast error here if you have one
//   }
// };


// Rename state to avoid conflict
const [settlePaymentMethod, setSettlePaymentMethod] = useState("UPI"); 

// --- PROCESS PAYMENT API ---
// const processPayment = async () => {
//   if (!amountToPay || amountToPay <= 0) return;
  
//   try {
//     // const token = localStorage.getItem('token');
//     // Adjust based on your data structure
//   const settlementId = settlementdata?.settlement
// ?._id ;
//  console.log("hello panipuri data..........",settlementdata);
 
//     console.log("hello manchuriyan.......",settlementId);

//    const response= await axios.post(
//       `http://localhost:5000/api/settlements/${settlementId}/payment`,
//       {
//         amount: Number(amountToPay),
//         paymentMethod: settlePaymentMethod // <--- Use the new name here
//       },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//      console.log("dosa........ taiyar haih .....",response);
   
//     setSettleStep('success');
    
//     // Auto-close logic
//     setTimeout(() => {
//       setIsSettleOpen(false);
//       setSettleStep('input');
//       setAmountToPay('');
//       setSettlePaymentMethod('UPI'); // Reset to default
//       // fetchGroupData(); // Call your refresh function here
//     }, 2000);

//   } catch (error) {
//     console.error("Payment Error", error);
//     // Add toast error here
//   }
// };

const processPayment = async () => {
  if (!amountToPay || amountToPay <= 0) return;

  try {
    const token = localStorage.getItem('UserCricBoxToken');
    const settlementId = settlementdata?.settlement?._id;

    // 1. Call the API
    const response = await axios.post(
      `http://localhost:5000/api/settlement/${settlementId}/payment`,
      { amount: Number(amountToPay), paymentMethod: settlePaymentMethod },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 2. MANUALLY SAVE TO STATE (Update UI immediately)
    setsettlementdata((prevData) => {
      // Create the new transaction object
      const newPayment = {
        amount: Number(amountToPay),
        paymentMethod: settlePaymentMethod,
        paidAt: new Date().toISOString(),
        status: "success",
        _id: Date.now() // Temporary ID
      };

      // Update the participants list
      const updatedParticipants = prevData.settlement.participants.map((p) => {
        // Find the logged-in user (payer)
        if (p.user._id === currentUserId) {
          return {
            ...p,
            transactions: [...p.transactions, newPayment] // Add new payment
          };
        }
        return p;
      });

      return { ...prevData, settlement: { ...prevData.settlement, participants: updatedParticipants } };
    });

    // 3. Success Animation
    setSettleStep('success');
    
    setTimeout(() => {
      setIsSettleOpen(false);
      setSettleStep('input');
      setAmountToPay('');
      setSettlePaymentMethod('UPI');
    }, 2000);

  } catch (error) {
    console.error("Payment Error", error);
  }
};
// --- 2. SEND REMINDER API ---
const sendReminder = async (memberUserId) => {
  try {
    const token = localStorage.getItem('token');
    const settlementId = settlementdata.settlement._id;
    console.log("Sending reminder for settlementId:", settlementId, "to userId:", memberUserId);

    const response = await axios.post(
      `http://localhost:5000/api/settlements/reminder`,
      {
        settlementId: settlementId,
        userId: memberUserId
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Reminder sent response:", response);
    toast.success("Reminder sent successfully!");
  } catch (error) {
    console.error("Reminder Error", error);
    toast.error(error.response?.data?.message || "Failed to send reminder");
  }
};

  const createSettlement = async () => {
 
  try {
    const totalAmount=localStorage.getItem("totalAmount");
   const response= await axios.post(
      `${routes.createSettlement}`, // `${url}/api/settlement/create`
      { groupId ,
        totalAmount
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
     
    );
     setPaymentData(response.data.data);
    console.log("payment create settlement",response);
    
    console.log("Settlement created / updated");
  } catch (error) {
    console.error("Settlement error:", error.response?.data || error.message);
  }
};


  // --- 1. FETCH GROUP DETAILS ---
 useEffect(() => {
  const fetchGroupDetails = async () => {
    if (!token || !groupId) return;

    try {
      setLoading(true);

      const response = await axios.post(
        routes.groupDetail,
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setGroupData(response.data.group);
        localStorage.setItem("totalAmount",response.data.group?.bookingId?.totalAmount)
        setAmountToPay(Math.abs(response.data.group.userBalance || 0));

      
         await createSettlement();
      }
    } catch (error) {
       console.error("Fetch group error:", error);
       console.log(error);
       
      toast.error("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  fetchGroupDetails();
}, [groupId, token]);


  // --- 2. ADMIN ACTION: ADD MEMBER ---
  const handleAddMember = async () => {
    if (!newMemberNick.trim()) return;

    try {
      setInviteLoading(true);
      await axios.post(
        `${routes.inviteGroup}`,
        { groupId: groupId, nickname: newMemberNick },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Invite sent to ${newMemberNick}`);
      setIsAddMemberOpen(false);
      setNewMemberNick("");
      // Optionally refresh group details here
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to invite user");
    } finally {
      setInviteLoading(false);
    }
  };

  // --- 3. ADMIN ACTION: BLOCK/REMOVE MEMBER ---
  const handleBlockMember = async (memberId) => {
    if(!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      // Assuming you have or will create this route
      await axios.post(
        'http://localhost:5000/api/group/remove-member', 
        { groupId: groupId, memberId: memberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Member removed successfully");
      
      // Update local state to remove member from list immediately
      setGroupData(prev => ({
        ...prev,
        members: prev.members.filter(m => m._id !== memberId) // Adjust based on your ID field
      }));

    } catch (error) {
      console.error(error);
      toast.error("Failed to remove member");
    }
  };

  // --- 4. REQUEST HANDLING (If applicable) ---
  const handleRequestAction = async (reqId, action) => {
    // Implement accept/reject request logic here
    toast.success(`Request ${action}`);
    // Update local state to remove the request
    setGroupData(prev => ({
        ...prev,
        requests: prev.requests.filter(r => r._id !== reqId)
    }));
  };

  // --- 5. SETTLE UP MOCK LOGIC ---
  // const processPayment = () => {
  //   setSettleStep('processing');
  //   setTimeout(() => {
  //     setSettleStep('success');
  //     // Optimistically update balance
  //     setGroupData(prev => ({ ...prev, userBalance: 0 }));
  //   }, 1500);
  //   setTimeout(() => {
  //     setIsSettleOpen(false);
  //     setSettleStep('input');
  //   }, 3000);
  // };

  useEffect(()=>{
  console.log("group data:::  ",groupData);
  console.log(groupData?.admin._id);
  console.log(currentUserId);
  
  
  },[groupData])

  useEffect(()=>{
    console.log("payment data::::",paymentData);
    

  },[paymentData])

  useEffect(()=>{
    const fetchSettlementDetails=async()=>{
      try {
        
     const response=await axios.get(`${routes.viewSettlement}/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      )
      console.log("this is the settlement detail ",response.data);
      setsettlementdata(response.data)

      } catch (error) {
        toast.error("something went wrong")
        console.log(error);
         
      }
    }
    fetchSettlementDetails()
  },[token])

  useEffect(()=>{
    const fetchMySettlement=async()=>{
      if (!settlementdata?.settlement?._id) return; // Wait for settlement data

      try {
        const response = await axios.get(`${routes.viewMySettlement}/${settlementdata.settlement._id}/my-status`,{
          headers: { Authorization: `Bearer ${token}` }
        })

        console.log("response check kar le .....",response);
        setmysettlement(response.data)

      } catch (error) {
        console.log(error);
        toast.error("Something went wrong please try again later !!!")

      }
    }

    fetchMySettlement();

  },[settlementdata, token])

  // Helpers
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : "U";
  const isAdmin = groupData?.admin._id===currentUserId ||false // Ensure your API returns this flag, or check logic: groupData?.adminId === currentUserId


   useEffect(()=>{
   console.log("settle kar ......................",settlementdata);
   
   },[settlementdata])
   
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-sm text-slate-500">Loading Pitch...</p>
        </div>
      </div>
    );
  }

  if (!groupData) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Headers />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/my-groups')} className="rounded-full hidden md:flex">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{groupData.name}</h1>
                 {isAdmin && <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Admin View</Badge>}
              </div>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">Group</span>
                {groupData.description || "Cricket & Turf Bookings"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
             {/* <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" /> Settings
             </Button> */}
             {isAdmin && (
               <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => setIsAddMemberOpen(true)}>
                  <UserPlus className="h-4 w-4" /> Add Member
               </Button>
             )}
          </div>
        </div>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEFT SIDEBAR --- */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* BALANCE CARD */}
            <Card className="bg-slate-900 text-white border-0 shadow-xl relative overflow-hidden">
               <div className="absolute top-[-20%] right-[-10%] opacity-10"><Wallet size={180} /></div>
               <CardContent className="p-6 relative z-10">
                 <div className="mb-6">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Your Net Position</p>
                    <h2 className="text-4xl font-bold mt-2 flex items-baseline gap-1">
                      ₹{Math.abs(mysettlement?.amountOwed || 0)}
                      <span className={`text-base font-medium px-2 py-0.5 rounded-md ml-2 ${mysettlement?.paymentStatus ==='pending' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                         {mysettlement?.paymentStatus ==='pending' ? "You Owe" : "You Get"}
                      </span>
                    </h2>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => setIsSettleOpen(true)} disabled={mysettlement?.paymentStatus==="paid"} className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold h-11">
                      Settle Up
                    </Button>
                    <Button  className="w-full bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 h-11">
                      <Plus className="h-4 w-4 mr-2" /> Expense
                    </Button>
                 </div>
               </CardContent>
            </Card>

          

            {/* MEMBERS WIDGET */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Members</CardTitle>
                <Badge variant="secondary">{groupData.bookingId?.groupMembers?.length || 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Pending Requests (Only Admin Sees) */}
                <AnimatePresence>
                 {isAdmin && groupData.requests && groupData.requests.length > 0 && (
                   <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                     <p className="text-xs font-bold text-orange-600 uppercase mb-2">Join Requests</p>
                     {groupData.requests.map((req) => (
                       <motion.div exit={{ height: 0, opacity: 0 }} key={req._id} className="flex items-center justify-between mb-2 last:mb-0">
                          <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{getInitials(req.name)}</AvatarFallback></Avatar>
                             <span className="text-sm font-medium">{req.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-100" onClick={() => handleRequestAction(req._id, "reject")}><X size={14}/></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-100" onClick={() => handleRequestAction(req._id, "accept")}><Check size={14}/></Button>
                          </div>
                       </motion.div>
                     ))}
                   </div>
                 )}
                </AnimatePresence>

                {/* Member List */}

                
                <div className="space-y-1">
  {groupData.bookingId?.groupMembers?.map((member) => (
    <div key={member._id} className="flex items-center justify-between group p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border border-slate-100">
          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
            {getInitials(member.memberId?.nickname)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium text-slate-900">{member.memberId?.nickname}</p>
            {member.memberId._id == groupData?.bookingId?.bookedBy && (
              <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <p className={`text-xs ${member.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
            {member.balance < 0 ? `Owes ₹${Math.abs(member.balance)}` : `Gets ₹${member.balance || 0}`}
          </p>
        </div>
      </div>

      {/* Admin Actions Area */}
      <div className="flex items-center gap-1">
        
        {/* --- NEW: REMINDER BUTTON --- */}
        {/* Show if: Admin AND Not Self AND Member Owes Money */}
        {isAdmin && member.memberId._id !== currentUserId  && (
          <Button
            size="icon"
            variant="ghost"
            title="Send Payment Reminder"
            className="h-8 w-8 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all"
            onClick={() => sendReminder(member.memberId._id)}
          >
            {/* <Bell className="h-4 w-4" /> */}
            Reminder
          </Button>
        )}

        {/* Existing Block Button */}
        {isAdmin && member.memberId._id !== currentUserId && (
          <div>
            
          <Button
            size="icon"
            variant="ghost"
            title="Block User"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            onClick={() => handleBlockMember(member._id)}
          >
            <Ban className="h-4 w-4" />
          </Button>
          </div>
        )}
      </div>
    </div>
  ))}
</div>
              </CardContent>
            </Card>
          </div>

          {/* --- MAIN FEED --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <Tabs defaultValue="activity" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-2 sm:w-[240px]">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                 <div className="relative w-full sm:w-64">
                   <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                   <Input placeholder="Search expenses..." className="pl-8 h-9" />
                 </div>
                 <Button variant="outline" size="icon" className="h-9 w-9"><Filter className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-1">Recent Activity</h3>
              
              {/* {groupData.expenses && groupData.expenses.length > 0 ? (
                  groupData.expenses.map((expense, i) => (
                    <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={expense._id || i} 
                    className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-md transition-all flex items-center justify-between"
                    >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                            {expense.category === 'Sport' ? '🏏' : '💸'}
                        </div>
                        <div className="space-y-1">
                        <h4 className="text-base font-semibold text-slate-900">{expense.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Badge variant="secondary" className="text-[10px] h-5 font-normal">{expense.category || "General"}</Badge>
                            <span>•</span>
                            <span>{expense.paidBy} paid <strong>₹{expense.amount}</strong></span>
                        </div>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {expense.date || "Today"}
                        </span>
                    </div>
                    </motion.div>
                ))
              ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                      <p className="text-slate-500">No expenses recorded yet.</p>
                  </div>
              )} */}


              {
                settlementdata &&
                <motion.div
                 initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 * 0.05 }}
                    className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-md transition-all flex items-center justify-between"
                >
                   <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                             🏏
                        </div>
                        <div className="space-y-1">
                        <h4 className="text-base font-semibold text-slate-900">{settlementdata?.settlement?.groupId?.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            {/* <Badge variant="secondary" className="text-[10px] h-5 font-normal">{expense.category || "General"}</Badge> */}
                            <span>•</span>
                            <span>{settlementdata?.settlement?.paidBy?.email} paid <strong>₹{settlementdata?.settlement?.totalAmount}</strong></span>
                        </div>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {settlementdata?.settlement?.bookingId?.date || "Today"}
                        </span>
                    </div>

                </motion.div>
              }
   {/* --- PAYMENT HISTORY SECTION --- */}
<div className="space-y-3 mt-6">
  
  {/* 1. Gather all transactions into one simple list */}
  {(() => {
    let allPayments = [];
    const receiverName = settlementdata?.settlement?.paidBy?.name || "Admin";

    // Loop through everyone to get their payments
    settlementdata?.settlement?.participants?.forEach((participant) => {
      participant.transactions.forEach((txn) => {
        allPayments.push({
          ...txn,
          payerName: participant.user.name,
          receiverName: receiverName
        });
      });
    });

    // 2. Sort and Display
    return allPayments
      .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)) // Newest first
      .map((txn, index) => (
        
        // YOUR UI CARD DESIGN
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
             {/* Icon */}
             <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                {txn.paymentMethod === 'Cash' ? '💵' : '💸'}
             </div>

             <div className="space-y-1">
                <h4 className="text-base font-semibold text-slate-900">
                   {txn.payerName} <span className="text-sm font-normal text-slate-500">paid</span> {txn.receiverName}
                </h4>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                   <span>{txn.paymentMethod}</span>
                   <span>•</span>
                   <strong>₹{txn.amount}</strong>
                </div>
             </div>
          </div>

          <div className="text-right">
             <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {new Date(txn.paidAt).toLocaleDateString()}
             </span>
          </div>
        </motion.div>
      ));
  })()}
</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* --- MODAL: ADD MEMBER (Admin Only) --- */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-sm">
            <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p className="text-sm text-slate-500">Enter the unique nickname of the user you want to invite.</p>
                <Input 
                    placeholder="e.g. virat_kohli_18" 
                    value={newMemberNick}
                    onChange={(e) => setNewMemberNick(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                <Button onClick={handleAddMember} disabled={inviteLoading || !newMemberNick}>
                    {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Invite"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: SETTLE UP --- */}
 <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
  <DialogContent className="sm:max-w-md">
    <AnimatePresence mode="wait">
      {settleStep === 'input' ? (
        <motion.div 
          key="input"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="p-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-1">Settle Up</h3>
            <p className="text-sm text-slate-500">Clear your dues</p>
          </div>
          
          {/* Amount Input */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-4xl font-bold text-slate-300">₹</span>
            <Input 
              type="number"
              value={amountToPay}
              onChange={(e) => setAmountToPay(e.target.value)}
              placeholder="0"
              className="border-none text-center text-5xl font-black w-48 h-16 p-0 focus-visible:ring-0 placeholder:text-slate-200"
            />
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block text-center">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["UPI", "Cash", "Bank Transfer", "Other"].map((method) => (
                <button
                  key={method}
                  onClick={() => setSettlePaymentMethod(method)} // <--- Updated
                  className={`text-sm font-medium py-2.5 px-3 rounded-lg border transition-all ${
                    settlePaymentMethod === method // <--- Updated
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={processPayment} 
            size="lg" 
            className="w-full text-lg bg-slate-900 hover:bg-slate-800 h-12"
            disabled={!amountToPay || Number(amountToPay) <= 0}
          >
            Pay Now
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          key="success"
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Paid Successfully!</h3>
          <p className="text-slate-500 mt-2">Via {settlePaymentMethod}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default GroupDashboard;