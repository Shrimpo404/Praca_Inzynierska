import {Card} from "./ui/Card.jsx"
import {Button} from "./ui/Button.jsx"
import {Badge} from "./ui/Badge.jsx"
import {Users, Bed} from "lucide-react"

export function RoomCard({ room, onBook }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-56 overflow-hidden">
                <img src={room.ImageURL} alt={room.Name} className="w-full h-full object-cover"/>
                {room.Status !== 1 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg ">Nie Dostępny</Badge>
                    </div>
                )}
            </div>
            <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="mb-1">{room.Name}</h3>
                        <Badge variant="outline">{room.Type}</Badge>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground text-sm">za noc</p>
                        <p className="text-primary">{room.Price} zł</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{room.Capacity} osobowy</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{room.Beds}</span>
                    </div>
                </div>
            {/*może dodać ikonki co dostępne*/}
                <Button
                    className="w-full"
                    onClick={() => onBook(room)}
                    disabled={room.Status !== 1}>
                    {room.Status === 1 ? "Zarezerwuj" : "Nie dostępny"}
                </Button>
            </div>
        </Card>
    )
}