import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card.jsx";
import { Button } from "./ui/Button.jsx";
import { Mail, Phone, User, ArrowLeft } from "lucide-react";

export function BookingForm({ room, searchDetails, onConfirm, onCancel }) {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [availableServices, setAvailableServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    const nights = Math.ceil((searchDetails.checkOut.getTime() - searchDetails.checkIn.getTime()) / (1000 * 60 * 60 * 24));

    useEffect(() => {
        fetch("http://localhost:8080/api/services")
            .then(res => res.json())
            .then(data => setAvailableServices(data))
            .catch(err => console.error("Błąd pobierania usług", err));
    }, []);

    const toggleService = (serviceId) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const calculateTotal = () => {
        const roomCost = nights * room.Price;
        const servicesCost = selectedServices.reduce((acc, id) => {
            const service = availableServices.find(s => s.ServiceID === id);
            return acc + (service ? Number(service.Price) : 0);
        }, 0);
        return roomCost + servicesCost;
    };

    const totalPrice = calculateTotal();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const bookingData = {
            ...formData,
            roomId: room.RoomID,
            checkIn: searchDetails.checkIn.toISOString().split('T')[0],
            checkOut: searchDetails.checkOut.toISOString().split('T')[0],
            price: totalPrice,
            adults: searchDetails.guests,
            selectedServices
        };

        try {
            const response = await fetch("http://localhost:8080/api/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                const result = await response.json();
                onConfirm({ ...bookingData, room, reservationId: result.reservationId, nights });
            } else {
                alert("Wystąpił błąd podczas składania rezerwacji.");
            }
        } catch (error) {
            console.error(error);
            alert("Błąd połączenia z serwerem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-6">
            {/* LEWA STRONA: Dane i Usługi */}
            <div className="flex-1 space-y-6">
                <Button variant="ghost" onClick={onCancel} className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Powrót
                </Button>

                <Card>
                    <CardHeader><CardTitle>Dane gościa</CardTitle></CardHeader>
                    <CardContent>
                        <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Imię</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <input required className="w-full pl-9 p-2 border rounded-md"
                                               value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nazwisko</label>
                                    <input required className="w-full p-2 border rounded-md"
                                           value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <input required type="email" className="w-full pl-9 p-2 border rounded-md"
                                           value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <input required type="tel" className="w-full pl-9 p-2 border rounded-md"
                                           value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Sekcja Usług Dodatkowych */}
                <Card>
                    <CardHeader><CardTitle>Dodatki do pobytu</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {availableServices.length > 0 ? availableServices.map(service => (
                                <div key={service.ServiceID}
                                     className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${selectedServices.includes(service.ServiceID) ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}
                                     onClick={() => toggleService(service.ServiceID)}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedServices.includes(service.ServiceID)}
                                            onChange={() => {}}
                                            className="h-4 w-4 accent-primary"
                                        />
                                        <div>
                                            <p className="font-medium">{service.Name}</p>
                                            <p className="text-xs text-muted-foreground">{service.Description}</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold">+{service.Price} zł</span>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-sm">Brak dostępnych usług dodatkowych.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PRAWA STRONA: Podsumowanie */}
            <div className="w-full md:w-80">
                <Card className="sticky top-24 shadow-lg border-primary/20">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="text-lg">Twoja Rezerwacja</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2 pb-4 border-b">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pokój</span>
                                <span className="font-medium">{room.Name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Termin</span>
                                <span className="font-medium">{nights} {nights === 1 ? 'noc' : 'noce'}</span>
                            </div>
                        </div>

                        {/* Wylistowanie kosztów */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Cena pokoju</span>
                                <span>{nights * room.Price} zł</span>
                            </div>
                            {selectedServices.map(id => {
                                const s = availableServices.find(serv => serv.ServiceID === id);
                                return s ? (
                                    <div key={id} className="flex justify-between text-sm text-green-600">
                                        <span>+ {s.Name}</span>
                                        <span>{s.Price} zł</span>
                                    </div>
                                ) : null;
                            })}
                        </div>

                        <div className="pt-4 border-t mt-4">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-lg">Razem</span>
                                <span className="font-bold text-2xl text-primary">{totalPrice} zł</span>
                            </div>
                            <Button className="w-full text-lg h-12" form="booking-form" type="submit" disabled={loading}>
                                {loading ? "Przetwarzanie..." : "Potwierdź rezerwację"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}