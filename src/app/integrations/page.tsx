"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Linkedin,
	Briefcase,
	Calendar,
	CheckCircle2,
	XCircle,
	RefreshCw,
	Settings,
	Link as LinkIcon,
	Unlink,
} from "lucide-react";
import { toast } from "sonner";

interface Integration {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	connected: boolean;
	lastSync?: string;
	features: string[];
}

export default function IntegrationsPage() {
	const [integrations, setIntegrations] = useState<Integration[]>([
		{
			id: "linkedin",
			name: "LinkedIn",
			description: "Import profile, search jobs, auto-apply",
			icon: <Linkedin className="w-6 h-6" />,
			connected: false,
			features: ["Profile Import", "Job Search", "Auto Apply", "Network Sync"],
		},
		{
			id: "indeed",
			name: "Indeed",
			description: "Search and apply to jobs automatically",
			icon: <Briefcase className="w-6 h-6" />,
			connected: false,
			features: ["Job Search", "Auto Apply", "Application Tracking"],
		},
		{
			id: "google-calendar",
			name: "Google Calendar",
			description: "Sync interview schedules",
			icon: <Calendar className="w-6 h-6" />,
			connected: false,
			features: ["Interview Scheduling", "Reminders", "Calendar Sync"],
		},
	]);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		loadIntegrationStatus();
	}, []);

	const loadIntegrationStatus = async () => {
		try {
			const response = await fetch("/api/integrations/status");
			if (response.ok) {
				const data = await response.json();
				setIntegrations((prev) =>
					prev.map((int) => ({
						...int,
						connected: data[int.id]?.connected || false,
						lastSync: data[int.id]?.lastSync,
					}))
				);
			}
		} catch (error) {
			console.error("Failed to load integration status:", error);
		}
	};

	const handleConnect = async (integrationId: string) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/integrations/${integrationId}/connect`, {
				method: "POST",
			});

			if (!response.ok) throw new Error("Connection failed");

			const data = await response.json();
			
			if (data.authUrl) {
				window.location.href = data.authUrl;
			} else {
				await loadIntegrationStatus();
				toast.success(`Successfully connected to ${integrationId}`);
			}
		} catch (error) {
			toast.error(`Failed to connect to ${integrationId}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDisconnect = async (integrationId: string) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/integrations/${integrationId}/disconnect`, {
				method: "POST",
			});

			if (!response.ok) throw new Error("Disconnection failed");

			await loadIntegrationStatus();
			toast.success(`Successfully disconnected from ${integrationId}`);
		} catch (error) {
			toast.error(`Failed to disconnect from ${integrationId}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSync = async (integrationId: string) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/integrations/${integrationId}/sync`, {
				method: "POST",
			});

			if (!response.ok) throw new Error("Sync failed");

			await loadIntegrationStatus();
			toast.success(`Successfully synced ${integrationId}`);
		} catch (error) {
			toast.error(`Failed to sync ${integrationId}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="max-w-6xl mx-auto space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Integrations</h1>
					<p className="text-muted-foreground">
						Connect your favorite job platforms and tools
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{integrations.map((integration) => (
						<Card key={integration.id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-3">
										{integration.icon}
										<div>
											<CardTitle className="text-lg">{integration.name}</CardTitle>
											<CardDescription className="text-sm">
												{integration.description}
											</CardDescription>
										</div>
									</div>
									{integration.connected ? (
										<Badge variant="default" className="bg-green-600">
											<CheckCircle2 className="w-3 h-3 mr-1" />
											Connected
										</Badge>
									) : (
										<Badge variant="outline">
											<XCircle className="w-3 h-3 mr-1" />
											Not Connected
										</Badge>
									)}
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label className="text-sm font-medium">Features</Label>
									<ul className="space-y-1">
										{integration.features.map((feature) => (
											<li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
												<CheckCircle2 className="w-3 h-3 text-green-600" />
												{feature}
											</li>
										))}
									</ul>
								</div>

								{integration.lastSync && (
									<p className="text-xs text-muted-foreground">
										Last synced: {new Date(integration.lastSync).toLocaleString()}
									</p>
								)}

								<div className="flex gap-2">
									{integration.connected ? (
										<>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleSync(integration.id)}
												disabled={isLoading}
												className="flex-1"
											>
												<RefreshCw className="w-4 h-4 mr-2" />
												Sync
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleDisconnect(integration.id)}
												disabled={isLoading}
											>
												<Unlink className="w-4 h-4" />
											</Button>
										</>
									) : (
										<Button
											onClick={() => handleConnect(integration.id)}
											disabled={isLoading}
											className="w-full"
										>
											<LinkIcon className="w-4 h-4 mr-2" />
											Connect
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Auto-Sync Settings</CardTitle>
						<CardDescription>
							Configure automatic synchronization for connected integrations
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Auto-sync LinkedIn profile</Label>
								<p className="text-sm text-muted-foreground">
									Automatically sync your LinkedIn profile daily
								</p>
							</div>
							<Switch />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Auto-sync job listings</Label>
								<p className="text-sm text-muted-foreground">
									Check for new jobs every hour
								</p>
							</div>
							<Switch />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Calendar reminders</Label>
								<p className="text-sm text-muted-foreground">
									Send reminders for upcoming interviews
								</p>
							</div>
							<Switch defaultChecked />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
