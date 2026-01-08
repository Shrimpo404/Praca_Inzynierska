import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card.jsx";
import { Button } from "./ui/Button.jsx";
import { Badge } from "./ui/Badge.jsx";
import { Search, User, CreditCard, CheckCircle, Bed } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export function MyReservationPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setReservations([]);
        setSearched(true);

        try {
            const response = await fetch(`http://localhost:8080/api/reservations/${searchQuery}`);
            const data = await response.json();

            if (response.ok) {
                // Zabezpieczenie: upewniamy się, że zawsze mamy tablicę
                if (Array.isArray(data)) {
                    setReservations(data);
                } else {
                    setReservations([data]);
                }
            } else {
                setError(data.error || "Nie znaleziono rezerwacji.");
            }
        } catch (err) {
            setError("Błąd połączenia z serwerem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2">Twoje Rezerwacje</h2>
                <p className="text-muted-foreground">Wpisz numer rezerwacji LUB swoje nazwisko, aby sprawdzić szczegóły.</p>
            </div>

            {/* WYSZUKIWARKA */}
            <Card className="mb-8 shadow-sm">
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Np. 15 lub Kowalski"
                            className="flex-1 border rounded-md px-4 py-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Szukam..." : <><Search className="w-4 h-4 mr-2"/> Szukaj</>}
                        </Button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-3 flex items-center justify-center gap-2"><Search className="w-4 h-4"/> {error}</p>}
                </CardContent>
            </Card>

            {/* WYNIKI - LISTA */}
            <div className="space-y-8">
                {reservations.map((reservation) => (
                    <div key={reservation.ReservationID} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="overflow-hidden border-t-4 border-t-black shadow-lg">
                            <CardHeader className="bg-gray-50 flex flex-row items-center justify-between border-b">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        Rezerwacja #{reservation.ReservationID}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Gość: <span className="font-medium text-black">{reservation.FirstName} {reservation.LastName}</span>
                                    </p>
                                </div>
                                <Badge className="text-base px-4 py-1" variant={reservation.Status === 'Confirmed' ? 'default' : 'destructive'}>
                                    {reservation.Status === 'Confirmed' ? 'Potwierdzona' : reservation.Status}
                                </Badge>
                            </CardHeader>

                            <CardContent className="p-6 space-y-6">
                                {/* Pokój i Termin */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2 text-primary">
                                            <Bed className="w-5 h-5"/> Szczegóły pobytu
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm border border-gray-100">
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-muted-foreground">Pokój:</span>
                                                <span className="font-medium">{reservation.RoomName} ({reservation.Type})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Od:</span>
                                                <span className="font-medium">{format(new Date(reservation.CheckIn), "PPP", {locale: pl})}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                                <span className="text-muted-foreground">Do:</span>
                                                <span className="font-medium">{format(new Date(reservation.CheckOut), "PPP", {locale: pl})}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Goście:</span>
                                                <span className="font-medium">{reservation.Adults} os.</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Płatność i Usługi */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold flex items-center gap-2 text-primary">
                                            <CreditCard className="w-5 h-5"/> Rozliczenie
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 h-full border border-gray-100 flex flex-col justify-between">
                                            <div>
                                                {reservation.services && reservation.services.length > 0 ? (
                                                    <div className="space-y-2 mb-4">
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Dodatki:</p>
                                                        {reservation.services.map((s, idx) => (
                                                            <div key={idx} className="flex justify-between text-gray-700">
                                                                <span>{s.Name} {s.Quantity > 1 && <span className="text-xs text-gray-500">(x{s.Quantity})</span>}</span>
                                                                <span className="font-medium">{s.Price * s.Quantity} zł</span>
                                                            </div>
                                                        ))}
                                                        <hr className="border-dashed border-gray-300 my-2"/>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground italic mb-4">Brak dodatkowych usług</p>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                <span className="font-bold text-lg">Do zapłaty na miejscu:</span>
                                                <span className="font-bold text-2xl text-black">{reservation.Price} zł</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dane kontaktowe */}
                                <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4"/>
                                        {reservation.Email} | {reservation.Phone}
                                    </div>
                                    {reservation.Status === 'Confirmed' && (
                                        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
                                            <CheckCircle className="w-3 h-3"/> Rezerwacja potwierdzona (Płatność w recepcji)
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}