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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { aptosClient } from "@/utils/aptosClient";
import { PAYROLL_STREAM_ABI, STREAM_STATUS, PayrollStreamInfo, PayrollStats, EmployeeStats } from "@/utils/payroll_stream_abi";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, Clock, DollarSign, Users, TrendingUp, Pause, Play, Download, 
  Plus, Settings, BarChart3, Calendar, AlertCircle, CheckCircle2,
  Eye, EyeOff, Copy, ExternalLink
} from "lucide-react";

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
  const [showDetails, setShowDetails] = useState(false);

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
      const interval = setInterval(fetchWithdrawableAmount, 10000);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Address copied to clipboard",
    });
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case STREAM_STATUS.ACTIVE:
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case STREAM_STATUS.PAUSED:
        return <Badge className="bg-yellow-500 text-white">Paused</Badge>;
      case STREAM_STATUS.COMPLETED:
        return <Badge className="bg-gray-500 text-white">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatAPT = (amount: string) => (parseFloat(amount) / 100000000).toFixed(8);
  const formatDate = (timestamp: string) => new Date(parseInt(timestamp) * 1000).toLocaleString();
  const formatShortAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const progress = (parseFloat(streamInfo.withdrawnAmount) / parseFloat(streamInfo.totalAmount)) * 100;
  const remainingAmount = parseFloat(streamInfo.totalAmount) - parseFloat(streamInfo.withdrawnAmount);
  const timeRemaining = Math.max(0, parseInt(streamInfo.endTime) - Math.floor(Date.now() / 1000));

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {streamInfo.description}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(streamAddress)}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {isEmployer ? (
                <>
                  Employee: <span className="font-mono">{formatShortAddress(streamInfo.employee)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(streamInfo.employee)}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  Employer: <span className="font-mono">{formatShortAddress(streamInfo.employer)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(streamInfo.employer)}
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(streamInfo.status)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
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
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <Label className="text-sm font-medium text-green-800">Available to Withdraw</Label>
            <p className="text-xl font-bold text-green-600">{formatAPT(withdrawableAmount)} APT</p>
          </div>
        )}

        {showDetails && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Stream Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Stream Rate:</span>
                <span className="ml-2 font-mono">{formatAPT(streamInfo.streamRate)} APT/sec</span>
              </div>
              <div>
                <span className="text-gray-600">Remaining:</span>
                <span className="ml-2 font-mono">{formatAPT(remainingAmount.toString())} APT</span>
              </div>
              <div>
                <span className="text-gray-600">Time Remaining:</span>
                <span className="ml-2 font-mono">
                  {timeRemaining > 0 ? `${Math.floor(timeRemaining / 86400)}d ${Math.floor((timeRemaining % 86400) / 3600)}h` : 'Expired'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Stream Address:</span>
                <span className="ml-2 font-mono text-xs">{formatShortAddress(streamAddress)}</span>
              </div>
            </div>
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

export function PayrollStreamEnhanced() {
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
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
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
      const durationInSeconds = Math.floor(parseFloat(duration) * 24 * 60 * 60).toString();

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
      setShowCreateDialog(false);
      
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
          <Badge variant="outline" className="ml-auto">
            {employerStreams.length + employeeStreams.length} Streams
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="employee" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employee" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Employee Dashboard
            </TabsTrigger>
            <TabsTrigger value="employer" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employer Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employee" className="space-y-4">
            {!isInitialized.employee ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Initialize Employee Account</h3>
                    <p className="text-gray-600 mb-4">
                      Initialize your account to start receiving payroll streams from employers.
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Your Streams</h3>
                    <Button variant="outline" size="sm" onClick={fetchData}>
                      <Clock className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  {employeeStreams.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No active streams found.</p>
                        <p className="text-sm text-gray-500 mt-2">Ask your employer to create a stream for you.</p>
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
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Initialize Employer Account</h3>
                    <p className="text-gray-600 mb-4">
                      Initialize your account to start creating and managing payroll streams for your employees.
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
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Total Deposited</p>
                          <p className="text-xl font-bold">{formatAPT(payrollStats.totalDeposited)} APT</p>
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
                          <p className="text-xl font-bold">{employerStreams.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Total Withdrawn</p>
                          <p className="text-xl font-bold">{formatAPT(payrollStats.totalWithdrawn)} APT</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Create Stream Form */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create New Stream
                      </CardTitle>
                      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Quick Create
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Create Payroll Stream</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="dialog-employee-address">Employee Address</Label>
                              <Input
                                id="dialog-employee-address"
                                placeholder="0x..."
                                value={employeeAddress}
                                onChange={(e) => setEmployeeAddress(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="dialog-amount">Amount (APT)</Label>
                                <Input
                                  id="dialog-amount"
                                  type="number"
                                  placeholder="100"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="dialog-duration">Duration (Days)</Label>
                                <Input
                                  id="dialog-duration"
                                  type="number"
                                  placeholder="30"
                                  value={duration}
                                  onChange={(e) => setDuration(e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="dialog-description">Description</Label>
                              <Textarea
                                id="dialog-description"
                                placeholder="Monthly salary for John Doe"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                              />
                            </div>
                            <Button onClick={handleCreateStream} disabled={isLoading} className="w-full">
                              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Create Stream
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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
                        onChange={(e) => setDescription(e.target.value)}
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Your Created Streams</h3>
                    <Button variant="outline" size="sm" onClick={fetchData}>
                      <Clock className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  {employerStreams.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No streams created yet.</p>
                        <p className="text-sm text-gray-500 mt-2">Create your first payroll stream above.</p>
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