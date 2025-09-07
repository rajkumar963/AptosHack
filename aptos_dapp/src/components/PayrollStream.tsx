"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { aptosClient } from "@/utils/aptosClient";
import { PAYROLL_STREAM_ABI, STREAM_STATUS, PayrollStreamInfo, PayrollStats, EmployeeStats } from "@/utils/payroll_stream_abi";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Clock, DollarSign, Users, TrendingUp, Pause, Play, Download } from "lucide-react";

interface StreamCardProps {
  streamAddress: string;
  streamInfo: PayrollStreamInfo;
  isEmployer: boolean;
  onRefresh: () => void;
}

function StreamCard({ streamAddress, streamInfo, isEmployer, onRefresh }: StreamCardProps) {
  const { client } = useWalletClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawableAmount, setWithdrawableAmount] = useState<string>("0");

  useEffect(() => {
    const fetchWithdrawableAmount = async () => {
      try {
        const result = await aptosClient().view({
          payload: {
            function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::calculate_withdrawable_amount`,
            functionArguments: [streamAddress],
          },
        });
        setWithdrawableAmount(result[0] as string);
      } catch (error) {
        console.error("Error fetching withdrawable amount:", error);
      }
    };

    if (streamInfo.status === STREAM_STATUS.ACTIVE) {
      fetchWithdrawableAmount();
      const interval = setInterval(fetchWithdrawableAmount, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [streamAddress, streamInfo.status]);

  const handleWithdraw = async () => {
    if (parseFloat(withdrawableAmount) === 0) {
      toast({
        title: "No funds available",
        description: "There are no funds available to withdraw at this time.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await client?.useABI(PAYROLL_STREAM_ABI).withdraw_from_stream({
         type_arguments: [],
         arguments: [streamAddress as `0x${string}`],
       });
      toast({
        title: "Withdrawal successful",
        description: `Successfully withdrew ${(parseFloat(withdrawableAmount) / 100000000).toFixed(8)} APT`,
      });
      onRefresh();
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast({
        title: "Withdrawal failed",
        description: "Failed to withdraw funds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseResume = async () => {
    setIsLoading(true);
    try {
      const functionCall = streamInfo.status === STREAM_STATUS.ACTIVE ? 'pause_stream' : 'resume_stream';
      await client?.useABI(PAYROLL_STREAM_ABI)[functionCall]({
         type_arguments: [],
         arguments: [streamAddress as `0x${string}`],
       });
      toast({
        title: `Stream ${streamInfo.status === STREAM_STATUS.ACTIVE ? 'paused' : 'resumed'}`,
        description: `Successfully ${streamInfo.status === STREAM_STATUS.ACTIVE ? 'paused' : 'resumed'} the stream.`,
      });
      onRefresh();
    } catch (error) {
      console.error("Pause/Resume failed:", error);
      toast({
        title: "Operation failed",
        description: "Failed to update stream status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case STREAM_STATUS.ACTIVE:
        return <Badge className="bg-green-500">Active</Badge>;
      case STREAM_STATUS.PAUSED:
        return <Badge className="bg-yellow-500">Paused</Badge>;
      case STREAM_STATUS.COMPLETED:
        return <Badge className="bg-gray-500">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatAPT = (amount: string) => (parseFloat(amount) / 100000000).toFixed(8);
  const formatDate = (timestamp: string) => new Date(parseInt(timestamp) * 1000).toLocaleString();

  const progress = (parseFloat(streamInfo.withdrawnAmount) / parseFloat(streamInfo.totalAmount)) * 100;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{streamInfo.description}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {isEmployer ? `Employee: ${streamInfo.employee}` : `Employer: ${streamInfo.employer}`}
            </p>
          </div>
          {getStatusBadge(streamInfo.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm font-medium">Total Amount</Label>
            <p className="text-lg font-semibold">{formatAPT(streamInfo.totalAmount)} APT</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Withdrawn</Label>
            <p className="text-lg font-semibold">{formatAPT(streamInfo.withdrawnAmount)} APT</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Start Date</Label>
            <p className="text-sm">{formatDate(streamInfo.startTime)}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">End Date</Label>
            <p className="text-sm">{formatDate(streamInfo.endTime)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {!isEmployer && streamInfo.status === STREAM_STATUS.ACTIVE && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <Label className="text-sm font-medium text-green-800">Available to Withdraw</Label>
            <p className="text-xl font-bold text-green-600">{formatAPT(withdrawableAmount)} APT</p>
          </div>
        )}

        <div className="flex gap-2">
          {!isEmployer && streamInfo.status === STREAM_STATUS.ACTIVE && (
            <Button 
              onClick={handleWithdraw} 
              disabled={isLoading || parseFloat(withdrawableAmount) === 0}
              className="flex-1"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Withdraw
            </Button>
          )}
          
          {isEmployer && streamInfo.status !== STREAM_STATUS.COMPLETED && (
            <Button 
              onClick={handlePauseResume} 
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : streamInfo.status === STREAM_STATUS.ACTIVE ? (
                <Pause className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {streamInfo.status === STREAM_STATUS.ACTIVE ? 'Pause' : 'Resume'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PayrollStream() {
  const { account } = useWallet();
  const { client } = useWalletClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [employerStreams, setEmployerStreams] = useState<string[]>([]);
  const [employeeStreams, setEmployeeStreams] = useState<string[]>([]);
  const [streamInfos, setStreamInfos] = useState<Record<string, PayrollStreamInfo>>({});
  const [payrollStats, setPayrollStats] = useState<PayrollStats>({ totalDeposited: "0", totalWithdrawn: "0" });
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats>({ totalEarned: "0", totalWithdrawn: "0" });
  const [isInitialized, setIsInitialized] = useState({ employer: false, employee: false });

  // Form states
  const [employeeAddress, setEmployeeAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const fetchData = async () => {
    if (!account?.address) return;

    try {
      // Fetch employer streams
      const employerResult = await aptosClient().view({
        payload: {
          function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::get_employer_streams`,
          functionArguments: [account.address],
        },
      });
      setEmployerStreams(employerResult[0] as string[]);

      // Fetch employee streams
      const employeeResult = await aptosClient().view({
        payload: {
          function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::get_employee_streams`,
          functionArguments: [account.address],
        },
      });
      setEmployeeStreams(employeeResult[0] as string[]);

      // Fetch payroll stats
      const payrollStatsResult = await aptosClient().view({
        payload: {
          function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::get_payroll_manager_stats`,
          functionArguments: [account.address],
        },
      });
      setPayrollStats({
        totalDeposited: payrollStatsResult[0] as string,
        totalWithdrawn: payrollStatsResult[1] as string,
      });

      // Fetch employee stats
      const employeeStatsResult = await aptosClient().view({
        payload: {
          function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::get_employee_stats`,
          functionArguments: [account.address],
        },
      });
      setEmployeeStats({
        totalEarned: employeeStatsResult[0] as string,
        totalWithdrawn: employeeStatsResult[1] as string,
      });

      // Fetch stream infos
      const allStreams = [...(employerResult[0] as string[]), ...(employeeResult[0] as string[])];
      const streamInfoPromises = allStreams.map(async (streamAddr) => {
        try {
          const info = await aptosClient().view({
            payload: {
              function: `${PAYROLL_STREAM_ABI.address}::payroll_stream::get_stream_info`,
              functionArguments: [streamAddr],
            },
          });
          return {
            address: streamAddr,
            info: {
              employer: info[0] as string,
              employee: info[1] as string,
              totalAmount: info[2] as string,
              withdrawnAmount: info[3] as string,
              startTime: info[4] as string,
              endTime: info[5] as string,
              streamRate: info[6] as string,
              status: info[7] as number,
              description: info[8] as string,
            } as PayrollStreamInfo,
          };
        } catch {
          return null;
        }
      });

      const streamResults = await Promise.all(streamInfoPromises);
      const newStreamInfos: Record<string, PayrollStreamInfo> = {};
      streamResults.forEach((result) => {
        if (result) {
          newStreamInfos[result.address] = result.info;
        }
      });
      setStreamInfos(newStreamInfos);

      // Check initialization status
      setIsInitialized({
        employer: (employerResult[0] as string[]).length > 0 || payrollStatsResult[0] !== "0",
        employee: (employeeResult[0] as string[]).length > 0 || employeeStatsResult[0] !== "0",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [account?.address]);

  const handleInitializeEmployer = async () => {
    setIsLoading(true);
    try {
      await client?.useABI(PAYROLL_STREAM_ABI).initialize_payroll_manager({
        type_arguments: [],
        arguments: [],
      });
      toast({
        title: "Employer initialized",
        description: "Successfully initialized payroll manager.",
      });
      fetchData();
    } catch (error) {
      console.error("Initialization failed:", error);
      toast({
        title: "Initialization failed",
        description: "Failed to initialize payroll manager. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeEmployee = async () => {
    setIsLoading(true);
    try {
      await client?.useABI(PAYROLL_STREAM_ABI).initialize_employee_streams({
        type_arguments: [],
        arguments: [],
      });
      toast({
        title: "Employee initialized",
        description: "Successfully initialized employee streams.",
      });
      fetchData();
    } catch (error) {
      console.error("Initialization failed:", error);
      toast({
        title: "Initialization failed",
        description: "Failed to initialize employee streams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStream = async () => {
    if (!employeeAddress || !amount || !duration || !description) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const amountInOctas = Math.floor(parseFloat(amount) * 100000000).toString();
      const durationInSeconds = Math.floor(parseFloat(duration) * 24 * 60 * 60).toString(); // Convert days to seconds

      await client?.useABI(PAYROLL_STREAM_ABI).create_stream({
         type_arguments: [],
         arguments: [employeeAddress as `0x${string}`, amountInOctas, durationInSeconds, description],
       });
      toast({
        title: "Stream created",
        description: `Successfully created stream for ${amount} APT over ${duration} days.`,
      });
      
      // Reset form
      setEmployeeAddress("");
      setAmount("");
      setDuration("");
      setDescription("");
      
      fetchData();
    } catch (error) {
      console.error("Stream creation failed:", error);
      toast({
        title: "Stream creation failed",
        description: "Failed to create stream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAPT = (amount: string) => (parseFloat(amount) / 100000000).toFixed(8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Payroll Streaming
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="employee" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employee">Employee Dashboard</TabsTrigger>
            <TabsTrigger value="employer">Employer Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="employee" className="space-y-4">
            {!isInitialized.employee ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Initialize Employee Account</h3>
                    <p className="text-gray-600 mb-4">
                      Initialize your account to start receiving payroll streams.
                    </p>
                    <Button onClick={handleInitializeEmployee} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Initialize Employee Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Employee Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Total Earned</p>
                          <p className="text-2xl font-bold">{formatAPT(employeeStats.totalEarned)} APT</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Total Withdrawn</p>
                          <p className="text-2xl font-bold">{formatAPT(employeeStats.totalWithdrawn)} APT</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Employee Streams */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Streams</h3>
                  {employeeStreams.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No active streams found.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    employeeStreams.map((streamAddr) => (
                      streamInfos[streamAddr] && (
                        <StreamCard
                          key={streamAddr}
                          streamAddress={streamAddr}
                          streamInfo={streamInfos[streamAddr]}
                          isEmployer={false}
                          onRefresh={fetchData}
                        />
                      )
                    ))
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="employer" className="space-y-4">
            {!isInitialized.employer ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Initialize Employer Account</h3>
                    <p className="text-gray-600 mb-4">
                      Initialize your account to start creating payroll streams.
                    </p>
                    <Button onClick={handleInitializeEmployer} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Initialize Employer Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Employer Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Total Deposited</p>
                          <p className="text-2xl font-bold">{formatAPT(payrollStats.totalDeposited)} APT</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Active Streams</p>
                          <p className="text-2xl font-bold">{employerStreams.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Create Stream Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Stream</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="employee-address">Employee Address</Label>
                      <Input
                        id="employee-address"
                        placeholder="0x..."
                        value={employeeAddress}
                        onChange={(e) => setEmployeeAddress(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount (APT)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="100"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (Days)</Label>
                        <Input
                          id="duration"
                          type="number"
                          placeholder="30"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Monthly salary for John Doe"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateStream} disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create Stream
                    </Button>
                  </CardContent>
                </Card>

                {/* Employer Streams */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Created Streams</h3>
                  {employerStreams.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No streams created yet.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    employerStreams.map((streamAddr) => (
                      streamInfos[streamAddr] && (
                        <StreamCard
                          key={streamAddr}
                          streamAddress={streamAddr}
                          streamInfo={streamInfos[streamAddr]}
                          isEmployer={true}
                          onRefresh={fetchData}
                        />
                      )
                    ))
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}