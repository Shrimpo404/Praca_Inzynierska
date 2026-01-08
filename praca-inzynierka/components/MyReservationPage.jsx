import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card.jsx";
import { Button } from "./ui/Button.jsx";
import { Badge } from "./ui/Badge.jsx";
import { Search, Calendar, User, CreditCard, CheckCircle, Bed } from "lucide-react";
import { format } from "date-fns";

export function MyReservationPage() {
    const [reservationId, setReservationId] = useState('');
    const [reservation, setReservation] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setReservation(null);

        try {
            const response = await fetch(`http://localhost:8080/api/reservations/${reservationId}`);
            const data = await response.json();

            if (response.ok) {
                setReservation(data);
            } else {
                setError(data.error || "Nie udało się znaleźć rezerwacji.");
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
                <h2 className="text-3xl font-bold mb-2">Znajdź swoją rezerwację</h2>
                <p className="text-muted-foreground">Wpisz numer rezerwacji, aby sprawdzić jej szczegóły i status.</p>
            </div>

            {/* WYSZUKIWARKA */}
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="number"
                            placeholder="Np. 15"
                            className="flex-1 border rounded-md px-4 py-2"
                            value={reservationId}
                            onChange={(e) => setReservationId(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Szukam..." : <><Search className="w-4 h-4 mr-2"/> Szukaj</>}
                        </Button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </CardContent>
            </Card>

            {/* WYNIKI */}
            {reservation && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="overflow-hidden border-t-4 border-t-primary">
                        <CardHeader className="bg-muted/20 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    Rezerwacja #{reservation.ReservationID}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Złożono przez: {reservation.FirstName} {reservation.LastName}</p>
                            </div>
                            <Badge className="text-base px-3 py-1" variant={reservation.Status === 'Confirmed' ? 'default' : 'destructive'}>
                                {reservation.Status === 'Confirmed' ? 'Potwierdzona' : reservation.Status}
                            </Badge>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6">
                            {/* Pokój i Termin */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Bed className="w-4 h-4 text-primary"/> Szczegóły pobytu
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Pokój:</span>
                                            <span className="font-medium">{reservation.RoomName} ({reservation.Type})</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Zameldowanie:</span>
                                            <span className="font-medium">{format(new Date(reservation.CheckIn), "dd MMM yyyy")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Wymeldowanie:</span>
                                            <span className="font-medium">{format(new Date(reservation.CheckOut), "dd MMM yyyy")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Goście:</span>
                                            <span className="font-medium">{reservation.Adults} dorosłych, {reservation.Kids} dzieci</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Płatność i Usługi */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-primary"/> Rozliczenie
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 h-full">
                                        {reservation.services && reservation.services.length > 0 ? (
                                            <div className="mb-4 pb-4 border-b border-dashed border-gray-300">
                                                <p className="text-xs text-muted-foreground mb-2">USŁUGI DODATKOWE:</p>
                                                {reservation.services.map((s, idx) => (
                                                    <div key={idx} className="flex justify-between">
                                                        <span>{s.Name}</span>
                                                        <span>+{s.Price} zł</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic mb-4">Brak dodatkowych usług</p>
                                        )}

                                        <div className="flex justify-between items-center pt-2">
                                            <span className="font-bold text-lg">Do zapłaty:</span>
                                            <span className="font-bold text-xl text-primary">{reservation.Price} zł</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dane kontaktowe */}
                            <div className="pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4"/>
                                Dane kontaktowe: {reservation.Email} | {reservation.Phone}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-sm text-blue-800">
                        <CheckCircle className="w-5 h-5 shrink-0"/>
                        <p>
                            Dziękujemy za wybór naszego hotelu. Jeśli chcesz zmodyfikować lub anulować rezerwację,
                            skontaktuj się z recepcją podając numer rezerwacji <b>#{reservation.ReservationID}</b>.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}