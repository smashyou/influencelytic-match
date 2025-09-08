import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Bell,
  Check,
  X,
  MessageSquare,
  DollarSign,
  UserCheck,
  Calendar,
  TrendingUp,
  AlertCircle,
  Mail,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

const notificationIcons: Record<string, any> = {
  new_application: UserCheck,
  application_accepted: Check,
  application_rejected: X,
  payment_received: DollarSign,
  payment_processed: DollarSign,
  campaign_match: Sparkles,
  campaign_deadline: Calendar,
  message_received: MessageSquare,
  follower_milestone: TrendingUp,
  system_alert: AlertCircle,
};

const notificationColors: Record<string, string> = {
  new_application: 'text-blue-500',
  application_accepted: 'text-green-500',
  application_rejected: 'text-red-500',
  payment_received: 'text-green-600',
  payment_processed: 'text-blue-600',
  campaign_match: 'text-purple-500',
  campaign_deadline: 'text-orange-500',
  message_received: 'text-gray-600',
  follower_milestone: 'text-pink-500',
  system_alert: 'text-yellow-500',
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          showToastNotification(newNotification);
          
          // Play notification sound
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const showToastNotification = (notification: Notification) => {
    const Icon = notificationIcons[notification.type] || Bell;
    
    toast(
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${notificationColors[notification.type]}`} />
        <div className="flex-1">
          <p className="font-medium">{notification.title}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
        </div>
      </div>,
      {
        duration: 5000,
      }
    );
  };

  const playNotificationSound = () => {
    // Create and play a notification sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUars5blmFgU7k9n1rX8hBSl+zPLaizsKGGS48+OeTQwLTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBSZ8x/PajDwKG2e58+OeTQ0LTKXh8b1pKAU2jdT0vHwcBQ==');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore errors if audio playback is blocked
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'new_application':
        window.location.href = `/dashboard/campaigns/${notification.data.campaign_id}/manage`;
        break;
      case 'application_accepted':
      case 'application_rejected':
        window.location.href = `/dashboard/applications`;
        break;
      case 'payment_received':
      case 'payment_processed':
        window.location.href = `/dashboard/payments`;
        break;
      case 'campaign_match':
        window.location.href = `/campaigns/${notification.data.campaign_id}`;
        break;
      case 'message_received':
        window.location.href = `/dashboard/messages/${notification.data.conversation_id}`;
        break;
      default:
        break;
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    const Icon = notificationIcons[type] || Bell;
    return <Icon className={`h-4 w-4 ${notificationColors[type]}`} />;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    px-3 py-3 hover:bg-accent cursor-pointer transition-colors
                    ${!notification.is_read ? 'bg-accent/50' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.is_read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center justify-center"
              onClick={() => {
                window.location.href = '/dashboard/notifications';
                setIsOpen(false);
              }}
            >
              View all notifications
              <ChevronRight className="h-4 w-4 ml-1" />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}