import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { SidebarTab } from "./Sidebar";
import Navbar from "./Navbar";
import GlobalSearch from "./GlobalSearch";
import DashboardHome from "./DashboardHome";
import MemberManagement from "./MemberManagement";
import AttendanceModule from "./AttendanceModule";
import BiometricCenter from "./BiometricCenter";
import TrainerModule from "./TrainerModule";
import BillingRenewals from "./BillingRenewals";
import SubscriptionRenewal from "./SubscriptionRenewal";
import InventoryModule from "./InventoryModule";
import ReportsModule from "./ReportsModule";
import SettingsModule from "./SettingsModule";
import { Toaster } from "sonner";
import { toast } from "sonner";

import { 
  initialMembers, 
  initialTrainers, 
  initialDevices, 
  initialBiometricEvents, 
  initialInventory, 
  initialNotifications,
  Member,
  Trainer,
  BiometricDevice,
  BiometricEvent,
  InventoryItem,
  NotificationItem,
  ActivityLog
} from "./mockData";

export default function DashboardApp() {
  // Global States
  const [currentTab, setCurrentTab] = useState<SidebarTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Database States
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [devices, setDevices] = useState<BiometricDevice[]>(initialDevices);
  const [biometricEvents, setBiometricEvents] = useState<BiometricEvent[]>(initialBiometricEvents);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  
  // Aggregate recent activities
  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: "ACT-01", type: "checkin", details: "Amit Patel checked in via Face terminal", timestamp: "10 mins ago" },
    { id: "ACT-02", type: "payment", details: "Priya Sharma paid ₹4,500 for Gold Plan", timestamp: "30 mins ago" },
    { id: "ACT-03", type: "checkin", details: "Deepak Malhotra checked in via Face terminal", timestamp: "1 hour ago" },
    { id: "ACT-04", type: "biometric", details: "Main Gate Face Terminal sync complete", timestamp: "2 hours ago" },
    { id: "ACT-05", type: "renewal", details: "Annual Platinum membership auto-renewed for Amit Patel", timestamp: "1 day ago" }
  ]);

  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);

  // Mark all notifications as read
  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read!");
  };

  // Sign out redirect
  const handleSignOut = () => {
    toast.info("Signing out of ERP session...");
    setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  };

  // Member management callbacks
  const handleAddMember = (newMember: Member) => {
    setMembers(prev => [newMember, ...prev]);
    // Log Activity
    const newAct: ActivityLog = {
      id: `ACT-${Date.now()}`,
      type: "renewal",
      details: `Registered and enrolled new member ${newMember.name}`,
      timestamp: "Just now"
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    // Log Activity if status changed
    const oldMember = members.find(m => m.id === updatedMember.id);
    if (oldMember && oldMember.status !== updatedMember.status) {
      const newAct: ActivityLog = {
        id: `ACT-${Date.now()}`,
        type: "renewal",
        details: `Member ${updatedMember.name} status updated to ${updatedMember.status}`,
        timestamp: "Just now"
      };
      setActivities(prev => [newAct, ...prev]);
    }
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  // Manual Check-In Callback
  const handleManualCheckIn = (memberId: string, timeStr: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          attendanceToday: true,
          checkInTime: timeStr,
          activityLogs: [
            { id: `AL-${Date.now()}`, type: "checkin", details: `Checked in manually by admin at ${timeStr}`, timestamp: "Just now" },
            ...m.activityLogs
          ]
        };
      }
      return m;
    }));

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // Log Activity
    const newAct: ActivityLog = {
      id: `ACT-${Date.now()}`,
      type: "checkin",
      details: `${member.name} checked in manually`,
      timestamp: "Just now"
    };
    setActivities(prev => [newAct, ...prev]);

    // Push Biometric Event
    const newEvent: BiometricEvent = {
      id: `EV-${Date.now()}`,
      timestamp: timeStr,
      memberName: member.name,
      deviceName: "Manual Gate Override",
      type: "Manual",
      status: "Success"
    };
    setBiometricEvents(prev => [newEvent, ...prev]);
  };

  // Manual Check-Out Callback
  const handleManualCheckOut = (memberId: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          attendanceToday: false,
          activityLogs: [
            { id: `AL-${Date.now()}`, type: "checkout", details: `Checked out manually by admin`, timestamp: "Just now" },
            ...m.activityLogs
          ]
        };
      }
      return m;
    }));

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // Log Activity
    const newAct: ActivityLog = {
      id: `ACT-${Date.now()}`,
      type: "checkout",
      details: `${member.name} checked out manually`,
      timestamp: "Just now"
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // Biometrics Sync Callbacks
  const handleSyncDevices = () => {
    // Increment devices todaySyncs
    setDevices(prev => prev.map(d => {
      if (d.status === "Online") {
        return {
          ...d,
          todaySyncs: d.todaySyncs + 8,
          lastSync: "Just now"
        };
      }
      return d;
    }));

    // Add random biometric events
    const syncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEvents: BiometricEvent[] = [
      { id: `EV-${Date.now()}-1`, timestamp: syncTime, memberName: "Amit Patel", deviceName: "Main Gate Face Terminal", type: "Face", status: "Success" },
      { id: `EV-${Date.now()}-2`, timestamp: syncTime, memberName: "Priya Sharma", deviceName: "Cardio Section Fingerprint", type: "Fingerprint", status: "Success" }
    ];
    setBiometricEvents(prev => [...newEvents, ...prev]);
  };

  // Billing Payments Processed Callback
  const handleRenewMember = (memberId: string, amount: number, method: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: "Active" as const,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          invoices: [
            {
              id: `INV-2026-${Date.now().toString().slice(-3)}`,
              date: new Date().toISOString().split('T')[0],
              amount,
              method: method as any,
              status: "Paid"
            },
            ...m.invoices
          ],
          activityLogs: [
            { id: `AL-${Date.now()}`, type: "payment", details: `Paid renewal fees ₹${amount} via ${method}`, timestamp: "Just now" },
            ...m.activityLogs
          ]
        };
      }
      return m;
    }));

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // Log Activity
    const newAct: ActivityLog = {
      id: `ACT-${Date.now()}`,
      type: "payment",
      details: `${member.name} renewed plan via ${method} (Paid ₹${amount})`,
      timestamp: "Just now"
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // Sell item catalog Callback
  const handleSellItem = (itemId: string, quantity: number) => {
    let priceSold = 0;
    let soldItemName = "";
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        priceSold = item.price * quantity;
        soldItemName = item.name;
        return {
          ...item,
          stock: item.stock - quantity,
          salesCount: item.salesCount + quantity
        };
      }
      return item;
    }));

    // Log Activity
    const newAct: ActivityLog = {
      id: `ACT-${Date.now()}`,
      type: "payment",
      details: `Sold ${quantity}x "${soldItemName}" (Total ₹${priceSold})`,
      timestamp: "Just now"
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // Add stock Callback
  const handleAddStock = (itemId: string, quantity: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          stock: item.stock + quantity
        };
      }
      return item;
    }));
  };

  // Toggle Trainer Status Callback
  const handleToggleTrainerStatus = (id: string) => {
    setTrainers(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === "Active" ? "Inactive" : "Active"
        };
      }
      return t;
    }));
  };

  // Global search quick trigger callbacks
  const handleSelectMemberFromSearch = (memberId: string) => {
    setSelectedMemberId(memberId);
    setCurrentTab("members");
  };

  const handleTriggerQuickAction = (action: string) => {
    if (action === "add-member") {
      setCurrentTab("members");
      setTimeout(() => {
        // Find Register Member trigger inside MemberManagement
        const regButton = document.querySelector('button[title="Register Member"]') as HTMLButtonElement;
        if (regButton) regButton.click();
      }, 100);
    } else if (action === "check-in") {
      setCurrentTab("attendance");
    } else if (action === "collect-payment") {
      setCurrentTab("billing");
    } else if (action === "renew") {
      setCurrentTab("renewals");
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex select-none overflow-x-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== "members") setSelectedMemberId(undefined);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Page Layout Wrapper */}
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ paddingLeft: isSidebarCollapsed ? "104px" : "284px", paddingTop: "88px", paddingRight: "16px", paddingBottom: "16px" }}
      >
        {/* Top Navbar */}
        <Navbar 
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Global search ⌘K */}
        <GlobalSearch 
          isOpen={isSearchOpen} 
          onOpenChange={setIsSearchOpen}
          members={members}
          trainers={trainers}
          onSelectMember={handleSelectMemberFromSearch}
          onNavigateTab={(tab) => {
            setCurrentTab(tab);
            if (tab !== "members") setSelectedMemberId(undefined);
          }}
          onTriggerQuickAction={handleTriggerQuickAction}
        />

        {/* Dynamic Page Island with transitions */}
        <main className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full h-full"
            >
              {currentTab === "dashboard" && (
                <DashboardHome 
                  members={members} 
                  trainers={trainers} 
                  devices={devices} 
                  activities={activities}
                  onNavigate={(tab) => {
                    setCurrentTab(tab);
                    if (tab !== "members") setSelectedMemberId(undefined);
                  }}
                  onQuickAction={handleTriggerQuickAction}
                />
              )}

              {currentTab === "members" && (
                <MemberManagement 
                  members={members}
                  trainers={trainers}
                  onAddMember={handleAddMember}
                  onUpdateMember={handleUpdateMember}
                  onDeleteMember={handleDeleteMember}
                  selectedMemberId={selectedMemberId}
                  setSelectedMemberId={setSelectedMemberId}
                />
              )}

              {currentTab === "attendance" && (
                <AttendanceModule 
                  members={members}
                  biometricEvents={biometricEvents}
                  onManualCheckIn={handleManualCheckIn}
                  onManualCheckOut={handleManualCheckOut}
                />
              )}

              {currentTab === "biometrics" && (
                <BiometricCenter 
                  devices={devices}
                  biometricEvents={biometricEvents}
                  onSyncDevices={handleSyncDevices}
                />
              )}

              {currentTab === "trainers" && (
                <TrainerModule 
                  trainers={trainers}
                  members={members}
                  onToggleTrainerStatus={handleToggleTrainerStatus}
                />
              )}

              {currentTab === "billing" && (
                <BillingRenewals 
                  members={members}
                  onRenewMember={handleRenewMember}
                />
              )}

              {currentTab === "renewals" && (
                <SubscriptionRenewal 
                  members={members}
                  trainers={trainers}
                  onRenewMember={handleRenewMember}
                />
              )}

              {currentTab === "inventory" && (
                <InventoryModule 
                  inventory={inventory}
                  onSellItem={handleSellItem}
                  onAddStock={handleAddStock}
                />
              )}

              {currentTab === "reports" && (
                <ReportsModule />
              )}

              {currentTab === "settings" && (
                <SettingsModule />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Alerts system */}
      <Toaster position="bottom-right" richColors theme="dark" />
    </div>
  );
}
