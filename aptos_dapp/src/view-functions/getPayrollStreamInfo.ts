import { aptosClient } from "@/utils/aptosClient";
import { PAYROLL_STREAM_ABI, PayrollStreamInfo, PayrollStats, EmployeeStats } from "@/utils/payroll_stream_abi";

/**
 * Get detailed information about a specific payroll stream
 */
export const getPayrollStreamInfo = async (streamAddress: string): Promise<PayrollStreamInfo | null> => {
  try {
    const result = await aptosClient().view({
      payload: {
        function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::get_stream_info`,
        functionArguments: [streamAddress],
      },
    });

    return {
      employer: result[0] as string,
      employee: result[1] as string,
      totalAmount: result[2] as string,
      withdrawnAmount: result[3] as string,
      startTime: result[4] as string,
      endTime: result[5] as string,
      streamRate: result[6] as string,
      status: result[7] as number,
      description: result[8] as string,
    };
  } catch (error) {
    console.error("Error fetching stream info:", error);
    return null;
  }
};

/**
 * Get all streams created by an employer
 */
export const getEmployerStreams = async (employerAddress: string): Promise<string[]> => {
  try {
    const result = await aptosClient().view({
      payload: {
        function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::get_employer_streams`,
        functionArguments: [employerAddress],
      },
    });
    return result[0] as string[];
  } catch (error) {
    console.error("Error fetching employer streams:", error);
    return [];
  }
};

/**
 * Get all streams for an employee
 */
export const getEmployeeStreams = async (employeeAddress: string): Promise<string[]> => {
  try {
    const result = await aptosClient().view({
      payload: {
        function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::get_employee_streams`,
        functionArguments: [employeeAddress],
      },
    });
    return result[0] as string[];
  } catch (error) {
    console.error("Error fetching employee streams:", error);
    return [];
  }
};

/**
 * Calculate the withdrawable amount for a stream
 */
export const getWithdrawableAmount = async (streamAddress: string): Promise<string> => {
  try {
    const result = await aptosClient().view({
      payload: {
        function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::calculate_withdrawable_amount`,
        functionArguments: [streamAddress],
      },
    });
    return result[0] as string;
  } catch (error) {
    console.error("Error calculating withdrawable amount:", error);
    return "0";
  }
};

/**
 * Get payroll manager statistics for an employer
 */
export const getPayrollManagerStats = async (employerAddress: string): Promise<PayrollStats> => {
  try {
    const result = await aptosClient().view({
      payload: {
        function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::get_payroll_manager_stats`,
        functionArguments: [employerAddress],
      },
    });
    return {
      totalDeposited: result[0] as string,
      totalWithdrawn: result[1] as string,
    };
  } catch (error) {
    console.error("Error fetching payroll manager stats:", error);
    return { totalDeposited: "0", totalWithdrawn: "0" };
  }
};

/**
 * Get employee statistics
 */
export const getEmployeeStats = async (employeeAddress: string): Promise<EmployeeStats> => {
  try {
    const result = await aptosClient().view({
      payload: {
        function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::get_employee_stats`,
        functionArguments: [employeeAddress],
      },
    });
    return {
      totalEarned: result[0] as string,
      totalWithdrawn: result[1] as string,
    };
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    return { totalEarned: "0", totalWithdrawn: "0" };
  }
};

/**
 * Helper function to format APT amounts from octas
 */
export const formatAPTAmount = (octas: string): string => {
  return (parseFloat(octas) / 100000000).toFixed(8);
};

/**
 * Helper function to format timestamps
 */
export const formatTimestamp = (timestamp: string): string => {
  return new Date(parseInt(timestamp) * 1000).toLocaleString();
};

/**
 * Helper function to calculate stream progress percentage
 */
export const calculateStreamProgress = (withdrawnAmount: string, totalAmount: string): number => {
  const withdrawn = parseFloat(withdrawnAmount);
  const total = parseFloat(totalAmount);
  return total > 0 ? (withdrawn / total) * 100 : 0;
};

/**
 * Helper function to check if a stream is active and has withdrawable funds
 */
export const hasWithdrawableFunds = async (streamAddress: string): Promise<boolean> => {
  try {
    const withdrawable = await getWithdrawableAmount(streamAddress);
    return parseFloat(withdrawable) > 0;
  } catch (error) {
    console.error("Error checking withdrawable funds:", error);
    return false;
  }
};

/**
 * Get comprehensive stream data including withdrawable amount
 */
export const getCompleteStreamData = async (streamAddress: string) => {
  try {
    const [streamInfo, withdrawableAmount] = await Promise.all([
      getPayrollStreamInfo(streamAddress),
      getWithdrawableAmount(streamAddress),
    ]);

    if (!streamInfo) {
      return null;
    }

    return {
      ...streamInfo,
      withdrawableAmount,
      progress: calculateStreamProgress(streamInfo.withdrawnAmount, streamInfo.totalAmount),
      formattedTotalAmount: formatAPTAmount(streamInfo.totalAmount),
      formattedWithdrawnAmount: formatAPTAmount(streamInfo.withdrawnAmount),
      formattedWithdrawableAmount: formatAPTAmount(withdrawableAmount),
      formattedStartTime: formatTimestamp(streamInfo.startTime),
      formattedEndTime: formatTimestamp(streamInfo.endTime),
    };
  } catch (error) {
    console.error("Error fetching complete stream data:", error);
    return null;
  }
};

/**
 * Get all streams for a user (both as employer and employee)
 */
export const getAllUserStreams = async (userAddress: string) => {
  try {
    const [employerStreams, employeeStreams, payrollStats, employeeStats] = await Promise.all([
      getEmployerStreams(userAddress),
      getEmployeeStreams(userAddress),
      getPayrollManagerStats(userAddress),
      getEmployeeStats(userAddress),
    ]);

    return {
      employerStreams,
      employeeStreams,
      payrollStats,
      employeeStats,
      totalStreams: employerStreams.length + employeeStreams.length,
    };
  } catch (error) {
    console.error("Error fetching all user streams:", error);
    return {
      employerStreams: [],
      employeeStreams: [],
      payrollStats: { totalDeposited: "0", totalWithdrawn: "0" },
      employeeStats: { totalEarned: "0", totalWithdrawn: "0" },
      totalStreams: 0,
    };
  }
};

/**
 * Convert days to seconds for stream duration
 */
export const daysToSeconds = (days: number): number => {
  return Math.floor(days * 24 * 60 * 60);
};

/**
 * Convert APT amount to octas
 */
export const aptToOctas = (apt: number): string => {
  return Math.floor(apt * 100000000).toString();
};