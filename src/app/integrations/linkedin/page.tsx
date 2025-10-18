"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Linkedin, Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface LinkedInProfile {
	firstName: string;
	lastName: string;
	headline: string;
	profilePicture: string;
	publicProfileUrl: string;
}

export default function LinkedInIntegration() {
	const [isConnecting, setIsConnecting] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [profile, setProfile] = useState<LinkedInProfile | null>(null);
	const [isImporting, setIsImporting] = useState(false);

	useEffect(() => {
		// Check if already connected
		checkConnection();
	}, []);

	const checkConnection = async () => {
		try {
			const response = await fetch("/api/integrations/linkedin/status");
			if (response.ok) {
				const data = await response.json();
				setIsConnected(data.connected);
				if (data.profile) {
					setProfile(data.profile);
				}
			}
		} catch (error) {
			console.error("Status check error:", error);
		}
	};

	const connectLinkedIn = async () => {
		setIsConnecting(true);
		try {
			const response = await fetch("/api/integrations/linkedin/auth");
			const { authUrl } = await response.json();

			// Open OAuth window
			const width = 600;
			const height = 700;
			const left = window.screenX + (window.outerWidth - width) / 2;
			const top = window.screenY + (window.outerHeight - height) / 2;

			const popup = window.open(
				authUrl,
				"LinkedIn Login",
				`width=${width},height=${height},left=${left},top=${top}`
			);

			// Listen for OAuth callback
			const checkPopup = setInterval(() => {
				if (!popup || popup.closed) {
					clearInterval(checkPopup);
					setIsConnecting(false);
					checkConnection();
				}
			}, 500);
		} catch (error) {
			console.error("Connection error:", error);
			toast.error("Failed to connect LinkedIn");
			setIsConnecting(false);
		}
	};

	const disconnectLinkedIn = async () => {
		try {
			await fetch("/api/integrations/linkedin/disconnect", {
				method: "POST",
			});
			setIsConnected(false);
			setProfile(null);
			toast.success("LinkedIn disconnected");
		} catch (error) {
			console.error("Disconnect error:", error);
			toast.error("Failed to disconnect");
		}
	};

	const importProfile = async () => {
		setIsImporting(true);
		try {
			const response = await fetch("/api/integrations/linkedin/import", {
				method: "POST",
			});

			if (!response.ok) throw new Error("Import failed");

			const data = await response.json();
			toast.success("Profile imported successfully!");

			// Redirect to CV builder with imported data
			window.location.href = `/cv-builder?imported=linkedin`;
		} catch (error) {
			console.error("Import error:", error);
			toast.error("Failed to import profile");
		} finally {
			setIsImporting(false);
		}
	};

	const searchJobs = async () => {
		window.open("/integrations/linkedin/jobs", "_blank");
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-4xl">
			<div className="mb-8">
				<h1 className="text-4xl font-bold flex items-center gap-2 mb-2">
					<Linkedin className="w-8 h-8 text-blue-600" />
					LinkedIn Integration
				</h1>
				<p className="text-muted-foreground">
					Connect your LinkedIn account to import your profile and discover job opportunities
				</p>
			</div>

			<div className="space-y-6">
				{/* Connection Status */}
				<Card>
					<CardHeader>
						<CardTitle>Connection Status</CardTitle>
						<CardDescription>
							Manage your LinkedIn account connection
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								{isConnected ? (
									<>
										<CheckCircle className="w-5 h-5 text-green-500" />
										<span className="font-medium">Connected</span>
									</>
								) : (
									<>
										<XCircle className="w-5 h-5 text-gray-400" />
										<span className="font-medium">Not Connected</span>
									</>
								)}
							</div>
							{isConnected ? (
								<Button onClick={disconnectLinkedIn} variant="outline">
									Disconnect
								</Button>
							) : (
								<Button onClick={connectLinkedIn} disabled={isConnecting}>
									{isConnecting ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Connecting...
										</>
									) : (
										<>
											<Linkedin className="w-4 h-4 mr-2" />
											Connect LinkedIn
										</>
									)}
								</Button>
							)}
						</div>

						{profile && (
							<div className="mt-4 p-4 bg-muted rounded-lg flex items-start gap-4">
								{profile.profilePicture && (
									<img
										src={profile.profilePicture}
										alt={profile.firstName}
										className="w-16 h-16 rounded-full"
									/>
								)}
								<div>
									<h3 className="font-semibold">
										{profile.firstName} {profile.lastName}
									</h3>
									<p className="text-sm text-muted-foreground">{profile.headline}</p>
									<a
										href={profile.publicProfileUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
									>
										View Profile
										<ExternalLink className="w-3 h-3" />
									</a>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Import Profile */}
				<Card>
					<CardHeader>
						<CardTitle>Import Profile to CV</CardTitle>
						<CardDescription>
							Automatically populate your CV with your LinkedIn profile data
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={importProfile}
							disabled={!isConnected || isImporting}
							className="w-full"
						>
							{isImporting ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Importing...
								</>
							) : (
								"Import Profile to CV Builder"
							)}
						</Button>
					</CardContent>
				</Card>

				{/* Job Search */}
				<Card>
					<CardHeader>
						<CardTitle>Job Search</CardTitle>
						<CardDescription>
							Discover and apply to jobs on LinkedIn
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={searchJobs}
							disabled={!isConnected}
							variant="outline"
							className="w-full"
						>
							Search LinkedIn Jobs
						</Button>
					</CardContent>
				</Card>

				{/* Features */}
				<Card>
					<CardHeader>
						<CardTitle>Available Features</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2">
							<li className="flex items-start gap-2">
								<CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
								<span>Import profile data (experience, education, skills)</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
								<span>Search and browse job postings</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
								<span>Track applications</span>
							</li>
							<li className="flex items-start gap-2">
								<CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
								<span>Sync connections and recommendations</span>
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
