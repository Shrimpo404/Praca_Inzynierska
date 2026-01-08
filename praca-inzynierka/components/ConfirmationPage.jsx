import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/Card.jsx";
import { CheckCircle, Home, ArrowRight, User, Calendar, CreditCard } from "lucide-react";
import { Button } from "./ui/Button.jsx";

export function ConfirmationPage({ booking, onNewBooking, onViewReservations }) {

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <Card className="max-w-lg w-full shadow-xl border-t-4 border-t-green-500">
                <div className="pt-8 flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                </div>

                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">Dziękujemy za rezerwację!</CardTitle>
                    <p className="text-muted-foreground mt-2">
                        Proces przebiegł pomyślnie.
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Sekcja z numerem ID */}
                    <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 text-center">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Numer Twojej rezerwacji</p>
                        <p className="text-4xl font-mono font-bold text-primary tracking-wider">
                            #{booking.reservationId}
                        </p>
                    </div>

                    {/* Szczegóły */}
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <span className="flex items-center text-muted-foreground">
                                <User className="w-4 h-4 mr-2" /> Główny gość
                            </span>
                            <span className="font-semibold text-gray-800">{booking.firstName} {booking.lastName}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <span className="flex items-center text-muted-foreground">
                                <Calendar className="w-4 h-4 mr-2" /> Termin
                            </span>
                            <span className="font-semibold text-gray-800">{booking.checkIn} - {booking.checkOut}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <span className="flex items-center text-muted-foreground">
                                <CreditCard className="w-4 h-4 mr-2" /> Do zapłaty (przy meldunku)
                            </span>
                            <span className="text-xl font-bold text-primary">{booking.price} zł</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t bg-gray-50/50">
                    <Button onClick={onNewBooking} variant="outline" className="w-full sm:w-1/2">
                        <Home className="mr-2 h-4 w-4" /> Strona Główna
                    </Button>

                    <Button onClick={onViewReservations} className="w-full sm:w-1/2">
                        Twoje rezerwacje <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}