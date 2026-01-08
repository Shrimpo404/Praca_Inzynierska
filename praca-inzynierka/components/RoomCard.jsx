import {Card} from "./ui/Card.jsx"
import {Button} from "./ui/Button.jsx"
import {Badge} from "./ui/Badge.jsx"
import {Users, Bed, CalendarX} from "lucide-react" // Dodano ikonę CalendarX

export function RoomCard({ room, onBook }) {
    const isUnavailable = room.IsBooked > 0 || room.IsActive !== 1;

    return (
        <Card className={`overflow-hidden transition-shadow ${isUnavailable ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-lg'}`}>
            <div className="relative h-56 overflow-hidden">
                <img src={room.ImageURL || "/placeholder.jpg"} alt={room.Name} className="w-full h-full object-cover"/>
                {isUnavailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                        <Badge variant="destructive" className="text-lg px-4 py-2 flex items-center gap-2">
                            <CalendarX className="w-5 h-5"/>
                            {room.IsActive !== 1 ? "W remoncie" : "Zajęty w tym terminie"}
                        </Badge>
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="mb-1 text-xl font-bold">{room.Name}</h3>
                        <Badge variant="outline">{room.Type}</Badge>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground text-sm">za noc</p>
                        <p className="text-primary font-bold text-lg">{room.Price} zł</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{room.Capacity} os.</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{room.Beds}</span>
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={() => onBook(room)}
                    disabled={isUnavailable}
                    variant={isUnavailable ? "secondary" : "default"}
                >
                    {isUnavailable ? "Niedostępny" : "Zarezerwuj"}
                </Button>
            </div>
        </Card>
    )
}