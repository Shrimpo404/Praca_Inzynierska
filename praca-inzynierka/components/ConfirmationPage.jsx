import {Card} from "./ui/Card.jsx"
import {CheckCircle, Home} from "lucide-react";
import {format} from "date-fns"
import {Button} from "./ui/Button.jsx";

export function ConfirmationPage({ booking, onNewBooking }) {
    const nights = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = nights * booking.room.price
    const bookingId = `BK${Date.now().toString().slice(-8)}`

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
            <div className="max-w-2x1 mx-auto">
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600"/>
                        </div>
                        <h1 className="mb-2">Zarezerwowano!</h1>
                        <p className="text-muted-foreground">
                            Twoja rezerwacja została pomyślnie utworzona
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Numer rezerwacji</p>
                            <p className="tracking-wider">{bookingId}</p>
                        </div>

                        <div className="space-y-4">
                            <h3>Szczegóły rezerwacji</h3>
                            <div className="space-y-3">
                                <Home className="h-5 w-5 text-muted-foreground mt-0.5"/>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Pokój</p>
                                    <p>{booking.room.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5"/>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Data Pobytu</p>
                                    <p>{format(booking.checkIn,"PPP")} - {format(booking.checkout, "PPP")}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{nights} {nights === 1 ? "noc" : "noce"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Goście</p>
                                    <p>{booking.guests} {booking.guests === 1 ? "gość" : "goście"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3>Guest Information</h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <p>{booking.guestName}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <p>{booking.email}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <p>{booking.phone}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-lg border-t-2 border-primary">
                        <div className="flex justify-between items-center">
                            <span>Total Amount</span>
                            <span className="text-primary">${totalPrice}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Payment will be collected at check-in
                        </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm">
                        <p className="mb-2">A confirmation email has been sent to {booking.email}</p>
                        <p className="text-muted-foreground">
                            Please present your confirmation number at check-in.
                        </p>
                    </div>

                    <Button onClick={onNewBooking} className="w-full" size="lg">
                        Stwórz kolejną rezerwację
                    </Button>
                </Card>
            </div>
        </div>
    )
}