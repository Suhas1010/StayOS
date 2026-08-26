export const USER_ROLES = {
    OWNER: "OWNER",
    CARETAKER: "CARETAKER",
    TENANT: "TENANT"
};
export const AvailableUserRoles = Object.values(USER_ROLES);
export const RENT_STATUS = {
    PENDING: "PENDING",
    PAID: "PAID",
    OVERDUE: "OVERDUE"
};
export const AvailableRentStatus = Object.values(RENT_STATUS);

export const COMPLAINT_STATUS = {
    REPORTED: "REPORTED",
    IN_PROGRESS: "IN_PROGRESS",
    RESOLVED: "RESOLVED"
};

export const AvailableComplaintStatus = Object.values(COMPLAINT_STATUS);