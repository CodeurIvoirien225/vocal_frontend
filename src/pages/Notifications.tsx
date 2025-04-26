import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mic, Home, Bell, BellOff, CheckCircle, AlertTriangle, Trash2, Menu, X } from 'lucide-react';
import { Notification } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [user, navigate]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://p6-groupeb.com/abass/backend/api/notifications.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `https://p6-groupeb.com/abass/backend/api/notifications.php?id=${notificationId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ read: true })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };


  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(
        `https://p6-groupeb.com/abass/backend/api/notifications.php?id=${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Échec de la suppression de la notification');
    }
  };

  // Optionnel: Ajoutez cette fonction pour supprimer toutes les notifications lues
  const deleteAllRead = async () => {
    try {
      const readIds = notifications
        .filter(n => n.read)
        .map(n => n.id);

      await Promise.all(readIds.map(id =>
        fetch(`https://p6-groupeb.com/abass/backend/api/notifications.php?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        })
      ));

      setNotifications(notifications.filter(n => !n.read));
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      setError('Échec de la suppression des notifications lues');
    }
  };


  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);

      await Promise.all(unreadIds.map(id =>
        fetch(`https://p6-groupeb.com/abass/backend/api/notifications.php?id=${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ read: true })
        })
      ));

      setNotifications(notifications.map(notification =>
        !notification.read
          ? { ...notification, read: true }
          : notification
      ));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });


  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
<header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mic className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            
            {/* Bouton hamburger pour mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-500 hover:text-gray-600 focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Navigation pour desktop */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`flex items-center gap-1 text-sm ${
                  unreadCount === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-indigo-600 hover:text-indigo-700'
                }`}
              >
                <CheckCircle className="h-5 w-5" />
                Tout marquer comme lu
              </button>
              <button
                onClick={deleteAllRead}
                disabled={notifications.length - unreadCount === 0}
                className={`flex items-center gap-1 text-sm ${
                  notifications.length - unreadCount === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-red-600 hover:text-red-700'
                }`}
              >
                <Trash2 className="h-5 w-5" />
                Supprimer les lues
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                <Home className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  markAllAsRead();
                  setMobileMenuOpen(false);
                }}
                disabled={unreadCount === 0}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm ${
                  unreadCount === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <CheckCircle className="h-5 w-5" />
                Tout marquer comme lu
              </button>
              <button
                onClick={() => {
                  deleteAllRead();
                  setMobileMenuOpen(false);
                }}
                disabled={notifications.length - unreadCount === 0}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm ${
                  notifications.length - unreadCount === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <Trash2 className="h-5 w-5" />
                Supprimer les lues
              </button>
              <button
                onClick={() => {
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
              >
                <Home className="h-5 w-5" />
                Accueil
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Bloc Filtres */}
            <div className="w-full md:w-1/4 bg-blue-100 bg-opacity-30 p-6 rounded-lg shadow h-fit">
              <h2 className="text-lg font-semibold mb-4 text-indigo-700">Filtres</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex items-center justify-between w-full text-left px-4 py-2 rounded ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-indigo-100 text-gray-700'
                  }`}
                >
                  <span>Tous</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {notifications.length}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex items-center justify-between w-full text-left px-4 py-2 rounded ${
                    filter === 'unread'
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-indigo-100 text-gray-700'
                  }`}
                >
                  <span>Non lus</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`flex items-center justify-between w-full text-left px-4 py-2 rounded ${
                    filter === 'read'
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-indigo-100 text-gray-700'
                  }`}
                >
                  <span>Lus</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {notifications.length - unreadCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Bloc Notifications */}
            <div className="w-full md:w-3/4 bg-white rounded-lg shadow">
              <div className="divide-y divide-gray-200">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => notification.related_entity_id && navigate(`/message/${notification.related_entity_id}`)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        notification.read ? 'bg-white' : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 flex-shrink-0 ${
                          notification.read ? 'text-gray-400' : 'text-indigo-600'
                        }`}>
                          {notification.read ? <BellOff size={18} /> : <Bell size={18} />}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{notification.content}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {format(new Date(notification.created_at), 'PPp', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                          >
                            Marquer comme lu
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-sm text-red-600 hover:text-red-700 whitespace-nowrap"
                        >
                          <Trash2 className="h-4 w-4 inline mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <BellOff className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Aucune notification
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filter === 'all'
                        ? "Vous n'avez aucune notification"
                        : filter === 'read'
                          ? "Vous n'avez aucune notification lue"
                          : "Vous n'avez aucune notification non lue"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}