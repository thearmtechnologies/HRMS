import React, { useEffect, useState, useContext } from "react";
import { Tabs, Spinner, Toast, ToastToggle } from "flowbite-react";
import VerificationTable from "../../components/hr/VerificationTable";
import VerificationModal from "../../components/hr/VerificationModal";
import {
  getPendingVerifications,
  getVerifiedRecords,
  getRejectedRecords,
  verifyDocument,
  rejectDocument,
} from "../../services/verificationService";
import { AuthContext } from "../../context/AuthContext";

export default function VerificationCenter() {
  const { user, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("pending");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchRecords = async () => {
    if (!token) return;
    setLoading(true);
    try {
      let data = [];
      if (activeTab === "pending") {
        data = await getPendingVerifications(token);
      } else if (activeTab === "verified") {
        data = await getVerifiedRecords(token);
      } else if (activeTab === "rejected") {
        data = await getRejectedRecords(token);
      }
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch verification records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeTab, token]);

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleVerify = async (employeeId, documentType) => {
    try {
      await verifyDocument(employeeId, documentType, token);
      setToastMsg(`Successfully verified ${documentType}.`);
      setIsModalOpen(false);
      fetchRecords(); // Refresh table
    } catch (error) {
      console.error("Verification failed", error);
      alert("Failed to verify document");
    }
  };

  const handleReject = async (employeeId, documentType, remarks) => {
    try {
      await rejectDocument(employeeId, documentType, remarks, token);
      setToastMsg(`Successfully rejected ${documentType}.`);
      setIsModalOpen(false);
      fetchRecords(); // Refresh table
    } catch (error) {
      console.error("Rejection failed", error);
      alert("Failed to reject document");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verification Center</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve employee documents and bank details.</p>
      </div>

      {toastMsg && (
        <Toast className="mb-4">
          <div className="text-sm font-normal">{toastMsg}</div>
          <ToastToggle onDismiss={() => setToastMsg("")} />
        </Toast>
      )}

      <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
        <Tabs aria-label="Verification tabs" variant="underline" onActiveTabChange={(tab) => {
          const tabNames = ["pending", "verified", "rejected"];
          setActiveTab(tabNames[tab]);
        }}>
          <Tabs.Item title="Pending Verifications" active={activeTab === "pending"}>
            {loading ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (
              <VerificationTable employees={employees} onView={handleView} />
            )}
          </Tabs.Item>
          
          <Tabs.Item title="Verified">
            {loading ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (
              <VerificationTable employees={employees} onView={handleView} />
            )}
          </Tabs.Item>
          
          <Tabs.Item title="Rejected">
            {loading ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (
              <VerificationTable employees={employees} onView={handleView} />
            )}
          </Tabs.Item>
        </Tabs>
      </div>

      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
        onVerify={handleVerify}
        onReject={handleReject}
      />
    </div>
  );
}
