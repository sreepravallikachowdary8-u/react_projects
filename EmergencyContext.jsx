import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_EMERGENCIES } from '../data/mockEmergencies';
import { INITIAL_RESCUE_TEAMS } from '../data/mockTeams';
import { INITIAL_ALERTS } from '../data/mockAlerts';
import { INITIAL_SHELTERS } from '../data/mockShelters';
import { INITIAL_SERVICES } from '../data/mockServices';
import { INITIAL_HAZARDS } from '../data/mockHazards';
import { INITIAL_ROAD_CLOSURES } from '../data/mockRoadClosures';
import { INITIAL_CONTACTS } from '../data/mockContacts';
import {
  getStoredItem,
  setStoredItem,
  STORAGE_KEYS,
  resetAllData
} from '../services/storageService';
import {
  getBrowserLocation,
  DEFAULT_CENTER,
  calculateDistanceKm
} from '../services/locationService';

const EmergencyContext = createContext(null);

export const EmergencyProvider = ({ children }) => {
  // 1. SOS Emergencies
  const [emergencies, setEmergencies] = useState(() => {
    return getStoredItem(STORAGE_KEYS.EMERGENCIES, INITIAL_EMERGENCIES);
  });

  // 2. Rescue Teams
  const [rescueTeams, setRescueTeams] = useState(() => {
    return getStoredItem(STORAGE_KEYS.RESCUE_TEAMS, INITIAL_RESCUE_TEAMS);
  });

  // 3. Disaster Alerts
  const [alerts, setAlerts] = useState(() => {
    return getStoredItem(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
  });

  // 4. Shelters
  const [shelters, setShelters] = useState(() => {
    return getStoredItem(STORAGE_KEYS.SHELTERS, INITIAL_SHELTERS);
  });

  // 5. Emergency Services
  const [services, setServices] = useState(() => {
    return getStoredItem(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  });

  // 6. Hazard Reports
  const [hazards, setHazards] = useState(() => {
    return getStoredItem(STORAGE_KEYS.HAZARDS, INITIAL_HAZARDS);
  });

  // 7. Road Closures
  const [roadClosures, setRoadClosures] = useState(() => {
    return getStoredItem(STORAGE_KEYS.ROAD_CLOSURES, INITIAL_ROAD_CLOSURES);
  });

  // 8. Emergency Contacts
  const [contacts, setContacts] = useState(() => {
    return getStoredItem(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
  });

  // 9. Notifications
  const [notifications, setNotifications] = useState(() => {
    const initialNotifs = [
      {
        id: 'notif-1',
        type: 'sos_update',
        title: 'Rescue Unit En Route',
        message: 'Bravo Fire & Hazmat is en route to SOS-7821 at 742 Harrison St.',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        read: false,
        emergencyId: 'SOS-7821'
      },
      {
        id: 'notif-2',
        type: 'alert',
        title: 'New Flood Warning Issued',
        message: 'Severe Flash Flood Warning activated for District 4 Lowland Basin.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 'notif-3',
        type: 'road',
        title: 'Major Road Closed',
        message: 'Portola Dr Mountain Pass blocked by fallen high-voltage lines.',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        read: true
      }
    ];
    return getStoredItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifs);
  });

  // 10. User Location
  const [userLocation, setUserLocation] = useState(() => {
    return getStoredItem(STORAGE_KEYS.USER_LOCATION, {
      lat: DEFAULT_CENTER.lat,
      lng: DEFAULT_CENTER.lng,
      accuracy: 15,
      isSimulated: true,
      source: 'Default Metro Command (Downtown)',
      status: 'idle'
    });
  });

  // Keep localStorage updated on every state change
  useEffect(() => {
    setStoredItem(STORAGE_KEYS.EMERGENCIES, emergencies);
  }, [emergencies]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.RESCUE_TEAMS, rescueTeams);
  }, [rescueTeams]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.ALERTS, alerts);
  }, [alerts]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.SHELTERS, shelters);
  }, [shelters]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.SERVICES, services);
  }, [services]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.HAZARDS, hazards);
  }, [hazards]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.ROAD_CLOSURES, roadClosures);
  }, [roadClosures]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.CONTACTS, contacts);
  }, [contacts]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    setStoredItem(STORAGE_KEYS.USER_LOCATION, userLocation);
  }, [userLocation]);

  /**
   * Helper: Add a system notification
   */
  const addNotification = (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notif
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  /**
   * Request browser location via Geolocation API
   */
  const refreshUserLocation = async () => {
    try {
      setUserLocation((prev) => ({ ...prev, status: 'loading' }));
      const loc = await getBrowserLocation();
      setUserLocation(loc);
      return { success: true, location: loc };
    } catch (err) {
      console.warn('Browser GPS unavailable, using fallback:', err.message);
      const fallback = {
        lat: DEFAULT_CENTER.lat,
        lng: DEFAULT_CENTER.lng,
        accuracy: 25,
        isSimulated: true,
        source: 'Simulated Metro Center (Fallback)',
        status: 'denied',
        errorMessage: err.message
      };
      setUserLocation(fallback);
      return { success: false, location: fallback, message: err.message };
    }
  };

  /**
   * Create an SOS Request (Citizen action)
   */
  const createSOS = ({
    type,
    description,
    peopleAffected,
    severity = 'Critical',
    location,
    citizenName,
    citizenEmail,
    citizenPhone,
    notifyContacts = true
  }) => {
    const id = `SOS-${Math.floor(7800 + Math.random() * 1900)}`;
    const now = new Date().toISOString();

    const newSOS = {
      id,
      type: type || 'General Emergency',
      severity,
      status: 'New', // New -> Assigned -> Rescue -> Resolved
      description: description || 'Immediate assistance requested by citizen.',
      peopleAffected: Number(peopleAffected) || 1,
      location: location || {
        lat: userLocation.lat,
        lng: userLocation.lng,
        address: 'Current Location via GPS',
        accuracy: userLocation.accuracy || 10,
        isGps: !userLocation.isSimulated
      },
      citizenName: citizenName || 'Anonymous Citizen',
      citizenEmail: citizenEmail || 'citizen@rescuenet.com',
      citizenPhone: citizenPhone || '+1 (555) 000-0000',
      assignedTeamId: null,
      assignedTeamName: null,
      assignedTeamPhone: null,
      notifyContacts,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'New',
          timestamp: now,
          note: `Distress beacon activated for ${type}. Rescue coordinators notified.`
        }
      ]
    };

    setEmergencies((prev) => [newSOS, ...prev]);

    // Create system notification
    addNotification({
      type: 'sos_created',
      title: `URGENT: ${type} SOS Broadcasted!`,
      message: `${citizenName || 'Citizen'} reported ${type} distress (${id}) at ${newSOS.location.address || 'GPS Coordinates'}.`,
      emergencyId: id
    });

    return newSOS;
  };

  /**
   * Assign a Rescue Team to an SOS (Admin or Rescue Team Accept action)
   */
  const assignRescueTeam = (emergencyId, teamId, customNote) => {
    const team = rescueTeams.find((t) => t.id === teamId);
    if (!team) return false;

    const now = new Date().toISOString();

    // 1. Update the emergency
    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id === emergencyId) {
          const updatedTimeline = [
            ...item.timeline,
            {
              status: 'Assigned',
              timestamp: now,
              note:
                customNote ||
                `Assigned ${team.name} (Specialization: ${team.specialization}). Units rolling out.`
            }
          ];
          return {
            ...item,
            status: 'Assigned',
            assignedTeamId: team.id,
            assignedTeamName: team.name,
            assignedTeamPhone: team.contact,
            updatedAt: now,
            timeline: updatedTimeline
          };
        }
        return item;
      })
    );

    // 2. Update the rescue team status
    setRescueTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            status: 'busy',
            activeAssignmentId: emergencyId
          };
        }
        return t;
      })
    );

    // 3. Add notification
    addNotification({
      type: 'team_assigned',
      title: `Team Dispatched: ${team.name}`,
      message: `${team.name} assigned to ${emergencyId}. Status is now ASSIGNED.`,
      emergencyId
    });

    return true;
  };

  /**
   * Update Emergency Status (Rescue Team / Admin action)
   * Lifecycle: New -> Assigned -> Rescue -> Resolved
   */
  const updateEmergencyStatus = (emergencyId, newStatus, note) => {
    const now = new Date().toISOString();
    let assignedTeamId = null;

    setEmergencies((prev) =>
      prev.map((item) => {
        if (item.id === emergencyId) {
          assignedTeamId = item.assignedTeamId;
          const statusNotes = {
            New: 'Request reopened or flagged for reassessment.',
            Assigned: `Units staged and moving towards target location.`,
            Rescue: `Rescue team has arrived on site. Active rescue and medical evacuation operations in progress.`,
            Resolved: `Operation successfully completed. All occupants secured, situation stabilized.`
          };

          const updatedTimeline = [
            ...item.timeline,
            {
              status: newStatus,
              timestamp: now,
              note: note || statusNotes[newStatus] || `Status updated to ${newStatus}.`
            }
          ];

          return {
            ...item,
            status: newStatus,
            updatedAt: now,
            timeline: updatedTimeline
          };
        }
        return item;
      })
    );

    // If resolved, free up the assigned rescue team back to 'available'
    if (newStatus === 'Resolved' && assignedTeamId) {
      setRescueTeams((prev) =>
        prev.map((t) => {
          if (t.id === assignedTeamId) {
            return {
              ...t,
              status: 'available',
              activeAssignmentId: null
            };
          }
          return t;
        })
      );
    }

    addNotification({
      type: 'status_changed',
      title: `Status: ${emergencyId} is ${newStatus.toUpperCase()}`,
      message: note || `Emergency ${emergencyId} status updated to ${newStatus}.`,
      emergencyId
    });

    return true;
  };

  /**
   * Delete an emergency request (demo data cleanup)
   */
  const deleteEmergency = (emergencyId) => {
    setEmergencies((prev) => prev.filter((e) => e.id !== emergencyId));
  };

  /**
   * Rescue Team Management
   */
  const updateTeamAvailability = (teamId, status) => {
    setRescueTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, status } : t))
    );
  };

  const addRescueTeam = (teamData) => {
    const newTeam = {
      id: `team-${Date.now()}`,
      status: 'available',
      membersCount: 6,
      distanceKm: 2.0,
      activeAssignmentId: null,
      ...teamData
    };
    setRescueTeams((prev) => [...prev, newTeam]);
    return newTeam;
  };

  const updateRescueTeam = (teamId, updatedData) => {
    setRescueTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, ...updatedData } : t))
    );
  };

  const deleteRescueTeam = (teamId) => {
    setRescueTeams((prev) => prev.filter((t) => t.id !== teamId));
  };

  /**
   * Disaster Alerts Management
   */
  const createAlert = (alertData) => {
    const newAlert = {
      id: `ALT-${Math.floor(100 + Math.random() * 900)}`,
      issuedAt: new Date().toISOString(),
      isActive: true,
      source: 'Metropolitan Emergency Command (MEC)',
      ...alertData
    };
    setAlerts((prev) => [newAlert, ...prev]);

    addNotification({
      type: 'alert_created',
      title: `Emergency Alert: ${newAlert.title}`,
      message: `${newAlert.area} - Severity: ${newAlert.severity}.`
    });

    return newAlert;
  };

  const updateAlert = (alertId, updatedData) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, ...updatedData } : a))
    );
  };

  const deleteAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const toggleAlertActive = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isActive: !a.isActive } : a))
    );
  };

  /**
   * Shelter Management
   */
  const addShelter = (shelterData) => {
    const newShelter = {
      id: `SHL-${Date.now()}`,
      status: 'Open',
      lastVerified: 'Just now',
      ...shelterData
    };
    setShelters((prev) => [newShelter, ...prev]);
    return newShelter;
  };

  const updateShelter = (shelterId, updatedData) => {
    setShelters((prev) =>
      prev.map((s) => (s.id === shelterId ? { ...s, ...updatedData } : s))
    );
  };

  const deleteShelter = (shelterId) => {
    setShelters((prev) => prev.filter((s) => s.id !== shelterId));
  };

  const updateShelterOccupancy = (shelterId, newOccupancy, newCapacity) => {
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id === shelterId) {
          const occ = Number(newOccupancy);
          const cap = newCapacity !== undefined ? Number(newCapacity) : s.capacity;
          const status = occ >= cap ? 'Full' : s.status === 'Closed' ? 'Closed' : 'Open';
          return {
            ...s,
            currentOccupancy: occ,
            capacity: cap,
            status,
            lastVerified: 'Just now'
          };
        }
        return s;
      })
    );
  };

  /**
   * Citizen Hazard Reports
   */
  const createHazardReport = (hazardData) => {
    const newHazard = {
      id: `HAZ-${Math.floor(300 + Math.random() * 600)}`,
      reportedAt: new Date().toISOString(),
      status: 'Submitted', // Submitted -> Under Review -> Verified -> Resolved (or Rejected)
      severity: 'High',
      adminNotes: 'Awaiting dispatch verification.',
      ...hazardData
    };
    setHazards((prev) => [newHazard, ...prev]);

    addNotification({
      type: 'hazard_reported',
      title: `Hazard Reported: ${newHazard.type}`,
      message: `Citizen reported hazard at ${newHazard.location?.address || 'Metro area'}.`
    });

    return newHazard;
  };

  const updateHazardStatus = (hazardId, newStatus, adminNotes) => {
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          return {
            ...h,
            status: newStatus,
            adminNotes: adminNotes !== undefined ? adminNotes : h.adminNotes
          };
        }
        return h;
      })
    );
  };

  /**
   * Road Closures Management
   */
  const addRoadClosure = (roadData) => {
    const newRoad = {
      id: `RC-${Date.now()}`,
      closedAt: new Date().toISOString(),
      status: 'Blocked',
      ...roadData
    };
    setRoadClosures((prev) => [newRoad, ...prev]);

    addNotification({
      type: 'road_closure',
      title: `Road Barricaded: ${newRoad.roadName}`,
      message: `${newRoad.reason}`
    });

    return newRoad;
  };

  const toggleRoadStatus = (roadId) => {
    setRoadClosures((prev) =>
      prev.map((r) => {
        if (r.id === roadId) {
          const nextStatus = r.status === 'Blocked' ? 'Open' : 'Blocked';
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  const deleteRoadClosure = (roadId) => {
    setRoadClosures((prev) => prev.filter((r) => r.id !== roadId));
  };

  /**
   * Contacts Management
   */
  const addContact = (contactData) => {
    const newContact = {
      id: `CNT-${Date.now()}`,
      isPrimary: false,
      notifyOnSOS: true,
      notifyBySms: true,
      notifyByCall: false,
      ...contactData
    };
    setContacts((prev) => [...prev, newContact]);
    return newContact;
  };

  const updateContact = (contactId, updatedData) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, ...updatedData } : c))
    );
  };

  const deleteContact = (contactId) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
  };

  const setPrimaryContact = (contactId) => {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        isPrimary: c.id === contactId
      }))
    );
  };

  /**
   * Notification Handlers
   */
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  /**
   * Reset All Demo Data to factory mock states
   */
  const resetDemoState = () => {
    setEmergencies(INITIAL_EMERGENCIES);
    setRescueTeams(INITIAL_RESCUE_TEAMS);
    setAlerts(INITIAL_ALERTS);
    setShelters(INITIAL_SHELTERS);
    setServices(INITIAL_SERVICES);
    setHazards(INITIAL_HAZARDS);
    setRoadClosures(INITIAL_ROAD_CLOSURES);
    setContacts(INITIAL_CONTACTS);
    resetAllData();
  };

  return (
    <EmergencyContext.Provider
      value={{
        emergencies,
        rescueTeams,
        alerts,
        shelters,
        services,
        hazards,
        roadClosures,
        contacts,
        notifications,
        userLocation,
        setUserLocation,
        refreshUserLocation,
        createSOS,
        assignRescueTeam,
        updateEmergencyStatus,
        deleteEmergency,
        updateTeamAvailability,
        addRescueTeam,
        updateRescueTeam,
        deleteRescueTeam,
        createAlert,
        updateAlert,
        deleteAlert,
        toggleAlertActive,
        addShelter,
        updateShelter,
        deleteShelter,
        updateShelterOccupancy,
        createHazardReport,
        updateHazardStatus,
        addRoadClosure,
        toggleRoadStatus,
        deleteRoadClosure,
        addContact,
        updateContact,
        deleteContact,
        setPrimaryContact,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        resetDemoState
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
