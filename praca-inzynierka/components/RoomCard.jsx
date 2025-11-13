import {Card} from "./ui/Card.jsx";
import {Button} from "./ui/Button.jsx";

export function RoomCard({ room, onBook }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-56 overflow-hidden">
                <img src={room.image} alt={room.name} className="w-full h-full object-cover"/>
                {!room.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary" className="text-lg">Nie Dostępny</Badge>
                    </div>
                )}
            </div>
            <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="mb-1">{room.name}</h3>
                        <Badge variant="outline">{room.type}</Badge>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground text-sm">za noc</p>
                        <p className="text-primary">${room.price}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{room.capacity} osobowy</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{room.beds}</span>
                    </div>
                </div>
            {/*może dodać ikonki co dostępne*/}
                <Button
                    className="w-full"
                    onClick={() => onBook(room)}
                    disabled={!room.available}>
                    {room.available ? "Zarezerwuj" : "Nie dostępny"}
                </Button>
            </div>
        </Card>
    )
}