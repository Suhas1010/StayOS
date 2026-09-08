const validateComplaintStatus = (status) => {
    const validStatuses = ["REPORTED", "IN_PROGRESS", "RESOLVED"];

    return validStatuses.includes(status);
};

export { validateComplaintStatus };