"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Loader2, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface CalendarEvent {
	id: string;
	summary: string;
	description: string;
	startTime: string;
	endTime: string;
	attendees: string[];
}

export default function GoogleCalendarIntegration() {
	const [isConnecting, setIsConnecting] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [isCreating, setIsCreating] = useState(false);
	const [newEvent, setNewEvent] = useState({
		summary: "",
		description: "",
		startTime: "",
		endTime: "",
		attendees: "",
	});

	useEffect(() => {
		checkConnection();
	}, []);

	const checkConnection = async () => {
		try {
			const response = await fetch("/api/integrations/google/calendar/status");
			if (response.ok) {
				const data = await response.json();
				setIsConnected(data.connected);
				if (data.connected) {
					loadEvents();
				}
			}
		} catch (error) {
			console.error("Status check error:", error);
		}
	};

	const connectGoogle = async () => {
		setIsConnecting(true);
		try {
			const response = await fetch("/api/integrations/google/auth");
			const { authUrl } = await response.json();

			const width = 600;
			const height = 700;
			const left = window.screenX + (window.outerWidth - width) / 2;
			const top = window.screenY + (window.outerHeight - height) / 2;

			const popup = window.open(
				authUrl,
				"Google Calendar Login",
				`width=${width},height=${height},left=${left},top=${top}`
			);

			const checkPopup = setInterval(() => {
				if (!popup || popup.closed) {
					clearInterval(checkPopup);
					setIsConnecting(false);
					checkConnection();
				}
			}, 500);
		} catch (error) {
			console.error("Connection error:", error);
			toast.error("Failed to connect Google Calendar");
			setIsConnecting(false);
		}
	};

	const disconnectGoogle = async () => {
		try {
			await fetch("/api/integrations/google/disconnect", {
				method: "POST",
			});
			setIsConnected(false);
			setEvents([]);
			toast.success("Google Calendar disconnected");
		} catch (error) {
			console.error("Disconnect error:", error);
			toast.error("Failed to disconnect");
		}
	};

	const loadEvents = async () => {
		try {
			const response = await fetch("/api/integrations/google/calendar/events");
			if (response.ok) {
				const data = await response.json();
				setEvents(data.events || []);
			}
		} catch (error) {
			console.error("Load events error:", error);
		}
	};

	const createEvent = async () => {
		if (!newEvent.summary || !newEvent.startTime || !newEvent.endTime) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsCreating(true);
		try {
			const response = await fetch("/api/integrations/google/calendar/events", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...newEvent,
					attendees: newEvent.attendees
						.split(",")
						.map((email) => email.trim())
						.filter(Boolean),
				}),
			});

			if (!response.ok) throw new Error("Failed to create event");

			toast.success("Interview event created!");
			setNewEvent({
				summary: "",
				description: "",
				startTime: "",
				endTime: "",
				attendees: "",
			});
			loadEvents();
		} catch (error) {
			console.error("Create event error:", error);
			toast.error("Failed to create event");
		} finally {
			setIsCreating(false);
		}
	};

	const deleteEvent = async (eventId: string) => {
		try {
			await fetch(`/api/integrations/google/calendar/events?id=${eventId}`, {
				method: "DELETE",
			});
			toast.success("Event deleted");
			loadEvents();
		} catch (error) {
			console.error("Delete event error:", error);
			toast.error("Failed to delete event");
		}
	};

	const exportToICS = async () => {
		try {
			const response = await fetch("/api/integrations/google/calendar/export");
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "interviews.ics";
			a.click();
			window.URL.revokeObjectURL(url);
			toast.success("Calendar exported!");
		} catch (error) {
			console.error("Export error:", error);
			toast.error("Failed to export calendar");
		}
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-6xl">
			<div className="mb-8">
				<h1 className="text-4xl font-bold flex items-center gap-2 mb-2">
					<CalendarIcon className="w-8 h-8 text-blue-600" />
					Google Calendar Integration
				</h1>
				<p className="text-muted-foreground">
					Manage your interview schedule with Google Calendar
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Connection & Create */}
				<div className="space-y-6">
					{/* Connection Status */}
					<Card>
						<CardHeader>
							<CardTitle>Connection</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								{isConnected ? (
									<div className="flex items-center gap-2">
										<CheckCircle className="w-5 h-5 text-green-500" />
										<span className="font-medium">Connected</span>
									</div>
								) : (
									<div className="flex items-center gap-2">
										<XCircle className="w-5 h-5 text-gray-400" />
										<span className="font-medium">Not Connected</span>
									</div>
								)}
							</div>
							{isConnected ? (
								<div className="space-y-2">
									<Button onClick={disconnectGoogle} variant="outline" className="w-full">
										Disconnect
									</Button>
									<Button onClick={exportToICS} variant="outline" className="w-full">
										Export to .ICS
									</Button>
								</div>
							) : (
								<Button
									onClick={connectGoogle}
									disabled={isConnecting}
									className="w-full"
								>
									{isConnecting ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Connecting...
										</>
									) : (
										<>
											<CalendarIcon className="w-4 h-4 mr-2" />
											Connect Google Calendar
										</>
									)}
								</Button>
							)}
						</CardContent>
					</Card>

					{/* Create Event */}
					<Card>
						<CardHeader>
							<CardTitle>Schedule Interview</CardTitle>
							<CardDescription>Create a new interview event</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>Title</Label>
								<Input
									value={newEvent.summary}
									onChange={(e) =>
										setNewEvent({ ...newEvent, summary: e.target.value })
									}
									placeholder="Interview with..."
									disabled={!isConnected}
								/>
							</div>
							<div>
								<Label>Description</Label>
								<Input
									value={newEvent.description}
									onChange={(e) =>
										setNewEvent({ ...newEvent, description: e.target.value })
									}
									placeholder="Position, details..."
									disabled={!isConnected}
								/>
							</div>
							<div>
								<Label>Start Time</Label>
								<Input
									type="datetime-local"
									value={newEvent.startTime}
									onChange={(e) =>
										setNewEvent({ ...newEvent, startTime: e.target.value })
									}
									disabled={!isConnected}
								/>
							</div>
							<div>
								<Label>End Time</Label>
								<Input
									type="datetime-local"
									value={newEvent.endTime}
									onChange={(e) =>
										setNewEvent({ ...newEvent, endTime: e.target.value })
									}
									disabled={!isConnected}
								/>
							</div>
							<div>
								<Label>Attendees (comma-separated emails)</Label>
								<Input
									value={newEvent.attendees}
									onChange={(e) =>
										setNewEvent({ ...newEvent, attendees: e.target.value })
									}
									placeholder="candidate@example.com, hr@company.com"
									disabled={!isConnected}
								/>
							</div>
							<Button
								onClick={createEvent}
								disabled={!isConnected || isCreating}
								className="w-full"
							>
								{isCreating ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<Plus className="w-4 h-4 mr-2" />
										Create Event
									</>
								)}
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Events List */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Upcoming Interviews</CardTitle>
							<CardDescription>Your scheduled interview events</CardDescription>
						</CardHeader>
						<CardContent>
							{!isConnected ? (
								<p className="text-muted-foreground text-center py-8">
									Connect your Google Calendar to view events
								</p>
							) : events.length === 0 ? (
								<p className="text-muted-foreground text-center py-8">
									No upcoming interviews scheduled
								</p>
							) : (
								<div className="space-y-4">
									{events.map((event) => (
										<div
											key={event.id}
											className="border rounded-lg p-4 flex items-start justify-between"
										>
											<div className="flex-1">
												<h3 className="font-semibold">{event.summary}</h3>
												{event.description && (
													<p className="text-sm text-muted-foreground mt-1">
														{event.description}
													</p>
												)}
												<p className="text-sm mt-2">
													<span className="font-medium">Start:</span>{" "}
													{format(new Date(event.startTime), "PPp")}
												</p>
												<p className="text-sm">
													<span className="font-medium">End:</span>{" "}
													{format(new Date(event.endTime), "PPp")}
												</p>
												{event.attendees && event.attendees.length > 0 && (
													<p className="text-sm mt-2">
														<span className="font-medium">Attendees:</span>{" "}
														{event.attendees.join(", ")}
													</p>
												)}
											</div>
											<Button
												onClick={() => deleteEvent(event.id)}
												variant="ghost"
												size="sm"
											>
												<Trash2 className="w-4 h-4 text-red-500" />
											</Button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
