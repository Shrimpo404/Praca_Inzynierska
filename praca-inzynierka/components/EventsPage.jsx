import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card.jsx";
import { Calendar, Clock, MapPin } from "lucide-react"; // Dodano ikonę MapPin
import { format } from "date-fns";

export function EventsPage() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/events")
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold mb-2">Nadchodzące Wydarzenia</h2>
                <p className="text-muted-foreground">Sprawdź co dzieje się w naszym hotelu i zaplanuj swój pobyt</p>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground">Aktualnie nie mamy zaplanowanych żadnych wydarzeń.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((evt) => (
                        <Card key={evt.EventID} className="hover:shadow-lg transition-all duration-300 group">
                            <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-200 transition-colors">
                                <Calendar className="h-16 w-16 opacity-50" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl">{evt.Name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm text-primary font-medium">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>
                                        {format(new Date(evt.StartDate), "dd.MM.yyyy, HH:mm")}
                                    </span>
                                </div>

                                {/* Wyświetlanie Sali */}
                                {evt.VenueName && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <span>{evt.VenueName}</span>
                                    </div>
                                )}

                                <p className="text-gray-600 text-sm leading-relaxed border-t pt-3 mt-2">
                                    {evt.Description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}