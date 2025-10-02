// Simple in-memory room registry simulation
// In production, this would be replaced with actual API calls to a backend

interface RoomData {
  roomCode: string;
  interviewerId: string;
  interviewerName: string;
  title: string;
  createdAt: number;
}

class RoomRegistry {
  private storageKey = 'global_interview_rooms';

  // Get all rooms from a global storage (simulating backend)
  getAllRooms(): RoomData[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Register a new room (simulating POST to backend)
  registerRoom(room: RoomData): void {
    const rooms = this.getAllRooms();
    const exists = rooms.find(r => r.roomCode === room.roomCode);
    if (!exists) {
      rooms.push(room);
      localStorage.setItem(this.storageKey, JSON.stringify(rooms));
    }
  }

  // Find a room by code (simulating GET from backend)
  findRoom(roomCode: string): RoomData | null {
    const rooms = this.getAllRooms();
    return rooms.find(r => r.roomCode.toUpperCase() === roomCode.toUpperCase()) || null;
  }

  // Check if room exists (simulating HEAD request)
  roomExists(roomCode: string): boolean {
    return this.findRoom(roomCode) !== null;
  }
}

export const roomRegistry = new RoomRegistry();
