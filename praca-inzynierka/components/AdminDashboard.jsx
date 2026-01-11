import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card.jsx";
import { Button } from "./ui/Button.jsx";
import { Badge } from "./ui/Badge.jsx";
import { Trash2, Edit, Plus, Calendar, Save, X, UserCog, Search } from "lucide-react";
import { format } from "date-fns";

function ReservationsTab() {
    const [reservations, setReservations] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    const fetchReservations = () => {
        fetch("http://localhost:8080/api/admin/reservations")
            .then(res => res.json())
            .then(data => setReservations(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tę rezerwację?")) return;
        await fetch(`http://localhost:8080/api/reservations/${id}`, { method: "DELETE" });
        fetchReservations();
    };

    const startEdit = (res) => {
        setEditingId(res.ReservationID);
        setEditForm({
            ...res,
            CheckIn: new Date(res.CheckIn).toISOString().split('T')[0],
            CheckOut: new Date(res.CheckOut).toISOString().split('T')[0]
        });
    };

    const saveEdit = async () => {
        await fetch(`http://localhost:8080/api/reservations/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Status: editForm.Status,
                RoomID: editForm.RoomID,
                CheckIn: editForm.CheckIn,
                CheckOut: editForm.CheckOut
            })
        });
        setEditingId(null);
        fetchReservations();
    };

    const filteredReservations = reservations.filter((res) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
            res.ReservationID.toString().includes(lowerSearch) ||
            res.LastName.toLowerCase().includes(lowerSearch) ||
            res.FirstName.toLowerCase().includes(lowerSearch) ||
            res.RoomNumber.toString().includes(lowerSearch)
        );
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Lista Rezerwacji</h2>
                <span className="text-sm text-muted-foreground">Łącznie: {filteredReservations.length}</span>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Szukaj po nazwisku, ID rezerwacji lub numerze pokoju..."
                    className="pl-9 w-full border rounded-md p-2 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-4">
                {filteredReservations.length > 0 ? (
                    filteredReservations.map((res) => (
                        <Card key={res.ReservationID} className="overflow-hidden">
                            <CardContent className="p-4">
                                {editingId === res.ReservationID ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-muted-foreground">Status</label>
                                                <select
                                                    className="w-full border rounded p-2"
                                                    value={editForm.Status}
                                                    onChange={e => setEditForm({...editForm, Status: e.target.value})}
                                                >
                                                    <option value="Confirmed">Potwierdzona</option>
                                                    <option value="Cancelled">Anulowana</option>
                                                    <option value="Pending">Oczekująca</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Nr Pokoju (ID)</label>
                                                <input
                                                    type="number"
                                                    className="w-full border rounded p-2"
                                                    value={editForm.RoomID}
                                                    onChange={e => setEditForm({...editForm, RoomID: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Od</label>
                                                <input
                                                    type="date"
                                                    className="w-full border rounded p-2"
                                                    value={editForm.CheckIn}
                                                    onChange={e => setEditForm({...editForm, CheckIn: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground">Do</label>
                                                <input
                                                    type="date"
                                                    className="w-full border rounded p-2"
                                                    value={editForm.CheckOut}
                                                    onChange={e => setEditForm({...editForm, CheckOut: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}><X className="w-4 h-4 mr-1"/> Anuluj</Button>
                                            <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4 mr-1"/> Zapisz</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">
                                                #{res.ReservationID} - {res.FirstName} {res.LastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Pokój {res.RoomNumber} • {format(new Date(res.CheckIn), "dd.MM.yyyy")} - {format(new Date(res.CheckOut), "dd.MM.yyyy")}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{res.Email}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={res.Status === 'Confirmed' ? 'default' : 'destructive'}>
                                                {res.Status}
                                            </Badge>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEdit(res)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(res.ReservationID)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-8">Nie znaleziono rezerwacji pasujących do wyszukiwania.</p>
                )}
            </div>
        </div>
    );
}

function EventsTab() {
    const [events, setEvents] = useState([]);
    const [venues, setVenues] = useState([]); // Stan dla listy sal
    const [newEvent, setNewEvent] = useState({ Name: '', Description: '', StartDate: '', EndDate: '', VenueID: '' });

    // Pobieramy wydarzenia oraz dostępne sale
    const fetchData = () => {
        fetch("http://localhost:8080/api/events")
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error(err));

        fetch("http://localhost:8080/api/venues")
            .then(res => res.json())
            .then(data => setVenues(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddEvent = async (e) => {
        e.preventDefault();
        await fetch("http://localhost:8080/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEvent)
        });
        // Reset formularza
        setNewEvent({ Name: '', Description: '', StartDate: '', EndDate: '', VenueID: '' });
        fetchData(); // Odśwież listę
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Usunąć to wydarzenie?")) return;
        await fetch(`http://localhost:8080/api/events/${id}`, { method: "DELETE" });
        fetchData();
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Dodaj nowe wydarzenie</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddEvent} className="grid gap-4 md:grid-cols-2 items-end">
                        <div>
                            <label className="text-sm font-medium">Nazwa</label>
                            <input required className="w-full border rounded p-2" value={newEvent.Name} onChange={e => setNewEvent({...newEvent, Name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Opis</label>
                            <input className="w-full border rounded p-2" value={newEvent.Description} onChange={e => setNewEvent({...newEvent, Description: e.target.value})} />
                        </div>

                        {/* Nowe pole: Wybór sali */}
                        <div>
                            <label className="text-sm font-medium">Sala</label>
                            <select
                                className="w-full border rounded p-2"
                                value={newEvent.VenueID}
                                onChange={e => setNewEvent({...newEvent, VenueID: e.target.value})}
                                required
                            >
                                <option value="">-- Wybierz salę --</option>
                                {venues.map(v => (
                                    <option key={v.VenueID} value={v.VenueID}>{v.Name} (max {v.Capacity} os.)</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Data Startu</label>
                            <input type="datetime-local" required className="w-full border rounded p-2" value={newEvent.StartDate} onChange={e => setNewEvent({...newEvent, StartDate: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Data Końca</label>
                            <input type="datetime-local" required className="w-full border rounded p-2" value={newEvent.EndDate} onChange={e => setNewEvent({...newEvent, EndDate: e.target.value})} />
                        </div>
                        <Button type="submit" className="md:col-span-2"><Plus className="mr-2 h-4 w-4"/> Dodaj Wydarzenie</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((evt) => (
                    <Card key={evt.EventID}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{evt.Name}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(evt.EventID)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-2">
                                <Calendar className="inline h-3 w-3 mr-1"/>
                                {new Date(evt.StartDate).toLocaleString()}
                            </div>
                            {/* Wyświetlanie nazwy sali */}
                            {evt.VenueName && (
                                <Badge variant="secondary" className="mb-2">{evt.VenueName}</Badge>
                            )}
                            <p className="text-sm text-gray-600">{evt.Description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function UsersTab() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ Username: '', Password: '', Role: 'employee' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchUsers = () => {
        fetch("http://localhost:8080/api/users")
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:8080/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        });

        if (res.ok) {
            setNewUser({ Username: '', Password: '', Role: 'employee' });
            fetchUsers();
        } else {
            const data = await res.json();
            alert(data.error || "Błąd dodawania użytkownika");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Czy na pewno usunąć tego użytkownika?")) return;
        await fetch(`http://localhost:8080/api/users/${id}`, { method: "DELETE" });
        fetchUsers();
    };

    const startEdit = (user) => {
        setEditingId(user.UserID);
        setEditForm({ ...user });
    };

    const saveEdit = async () => {
        await fetch(`http://localhost:8080/api/users/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm)
        });
        setEditingId(null);
        fetchUsers();
    };

    return (
        <div className="space-y-6">
            {/* Formularz dodawania */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Dodaj nowego pracownika</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddUser} className="grid gap-4 md:grid-cols-4 items-end">
                        <div>
                            <label className="text-sm font-medium">Login (Nazwa)</label>
                            <input required className="w-full border rounded p-2"
                                   value={newUser.Username} onChange={e => setNewUser({...newUser, Username: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Hasło</label>
                            <input required type="text" className="w-full border rounded p-2"
                                   value={newUser.Password} onChange={e => setNewUser({...newUser, Password: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Rola</label>
                            <select className="w-full border rounded p-2"
                                    value={newUser.Role} onChange={e => setNewUser({...newUser, Role: e.target.value})}>
                                <option value="employee">Pracownik</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                        <Button type="submit"><Plus className="mr-2 h-4 w-4"/> Dodaj</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Lista użytkowników */}
            <div className="grid gap-4">
                {users.map((u) => (
                    <Card key={u.UserID} className="overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between">
                            {editingId === u.UserID ? (
                                <div className="flex-1 grid grid-cols-3 gap-4 mr-4">
                                    <input className="border rounded p-2" value={editForm.Username} onChange={e => setEditForm({...editForm, Username: e.target.value})} />
                                    <input className="border rounded p-2" value={editForm.Password} onChange={e => setEditForm({...editForm, Password: e.target.value})} />
                                    <select className="border rounded p-2" value={editForm.Role} onChange={e => setEditForm({...editForm, Role: e.target.value})}>
                                        <option value="employee">Pracownik</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-bold text-lg flex items-center gap-2">
                                        <UserCog className="h-5 w-5 text-primary"/> {u.Username}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Rola: <Badge variant="secondary">{u.Role}</Badge> • Hasło: <span className="font-mono bg-gray-100 px-1 rounded">{u.Password}</span>
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {editingId === u.UserID ? (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}><X className="w-4 h-4"/></Button>
                                        <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4"/></Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => startEdit(u)}><Edit className="w-4 h-4"/></Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(u.UserID)}><Trash2 className="w-4 h-4"/></Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export function AdminDashboard({ currentUser }) {
    const [activeTab, setActiveTab] = useState("reservations");
    const isAdmin = currentUser?.role === 'admin';

    return (
        <div className="space-y-6">
            {/* Menu nawigacyjne */}
            <div className="flex space-x-2 border-b pb-2 overflow-x-auto">
                <Button
                    variant={activeTab === "reservations" ? "default" : "ghost"}
                    onClick={() => setActiveTab("reservations")}
                >
                    Zarządzanie Rezerwacjami
                </Button>
                <Button
                    variant={activeTab === "events" ? "default" : "ghost"}
                    onClick={() => setActiveTab("events")}
                >
                    Wydarzenia
                </Button>

                {isAdmin && (
                    <Button
                        variant={activeTab === "users" ? "default" : "ghost"}
                        onClick={() => setActiveTab("users")}
                    >
                        Użytkownicy
                    </Button>
                )}
            </div>

            {activeTab === "reservations" && <ReservationsTab />}
            {activeTab === "events" && <EventsTab />}
            {activeTab === "users" && isAdmin && <UsersTab />}
        </div>
    );
}