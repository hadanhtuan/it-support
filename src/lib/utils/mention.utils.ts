import { User } from '@/lib/core/models/user.model';
import { notificationService } from '@/services/notification.service';
import { NotificationType } from '@/lib/core/models/notification.model';

export interface MentionData {
  userId: string;
  username: string;
  displayName: string;
  startIndex: number;
  endIndex: number;
}

export class MentionUtils {
  // Regex to match @mentions in text - supports Unicode characters including Vietnamese and spaces in names
  private static readonly MENTION_REGEX = /@([^@]+?)(?=\s|$|@)/g;

  /**
   * Parse mentions from text and return mention data
   * @param text - The message text containing potential mentions
   * @param availableUsers - Users available in the chat room
   * @returns Array of MentionData objects
   */
  static parseMentions(text: string, availableUsers: User[]): MentionData[] {
    const mentions: MentionData[] = [];
    let match;

    // Reset regex index
    this.MENTION_REGEX.lastIndex = 0;

    while ((match = this.MENTION_REGEX.exec(text)) !== null) {
      const mentionText = match[1].trim(); // The username without @ and trimmed
      const startIndex = match.index;
      const endIndex = match.index + match[0].length;

      // Find user by exact fullname match first, then fallback to partial matching
      const mentionedUser =
        availableUsers.find(
          (user) =>
            user.fullname.toLowerCase() === mentionText.toLowerCase() ||
            user.email.toLowerCase() === mentionText.toLowerCase()
        ) ||
        availableUsers.find(
          (user) =>
            user.fullname.toLowerCase().includes(mentionText.toLowerCase()) ||
            user.email.toLowerCase().includes(mentionText.toLowerCase())
        );

      if (mentionedUser) {
        mentions.push({
          userId: mentionedUser.id,
          username: mentionText,
          displayName: mentionedUser.fullname,
          startIndex,
          endIndex
        });
      }
    }

    return mentions;
  }

  /**
   * Replace mentions in text with highlighted spans for display
   * @param text - The original text
   * @param mentions - Array of mention data
   * @returns HTML string with highlighted mentions
   */
  static highlightMentions(text: string, mentions: MentionData[]): string {
    if (!mentions || mentions.length === 0) {
      return text;
    }

    // Sort mentions by start index in descending order (process from right to left)
    // This way, the indices remain valid as we modify the string
    const sortedMentions = [...mentions].sort((a, b) => b.startIndex - a.startIndex);

    let result = text;

    sortedMentions.forEach((mention) => {
      const beforeMention = result.substring(0, mention.startIndex);
      const afterMention = result.substring(mention.endIndex);
      const afterMentionProcessed = this.removeFirstChars(afterMention, this.getPartNameLength(mention.displayName));
      const highlightedMention = `<span class="mention" data-user-id="${mention.userId}">@${mention.displayName}</span>`;

      result = beforeMention + highlightedMention + afterMentionProcessed;
    });

    return result;
  }

  /**
   * Extract user IDs from mentions
   * @param mentions - Array of mention data
   * @returns Array of user IDs
   */
  static extractMentionedUserIds(mentions: MentionData[]): string[] {
    return mentions.map((mention) => mention.userId);
  }

  /**
   * Generate autocomplete suggestions based on input
   * @param input - Current input text
   * @param availableUsers - Users available for mentioning
   * @param currentUserId - ID of current user (to exclude from suggestions)
   * @returns Array of user suggestions
   */
  static generateMentionSuggestions(input: string, availableUsers: User[], currentUserId: string): User[] {
    // Find if user is currently typing a mention - updated to support Unicode characters and spaces
    const mentionMatch = input.match(/@([^@]*)$/);

    if (!mentionMatch) {
      return [];
    }

    const searchTerm = mentionMatch[1].toLowerCase().trim();

    return availableUsers
      .filter(
        (user) =>
          user.id !== currentUserId &&
          (user.fullname.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm))
      )
      .slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Insert mention into text at cursor position
   * @param text - Current text
   * @param cursorPosition - Current cursor position
   * @param mentionedUser - User to mention
   * @returns Object with new text and cursor position
   */
  static insertMention(text: string, cursorPosition: number, user: User): { text: string; cursorPosition: number } {
    // Find the @ symbol and any partial text after it
    let atPosition = cursorPosition;

    // Move backwards to find the @ symbol
    while (atPosition > 0 && text[atPosition - 1] !== '@') {
      atPosition--;
    }

    // If we found an @ symbol, replace from @ to cursor with the mention
    if (atPosition > 0 && text[atPosition - 1] === '@') {
      const beforeAt = text.substring(0, atPosition - 1); // Everything before @
      const afterCursor = text.substring(cursorPosition); // Everything after cursor
      const mention = `@${user.fullname}`;

      const newText = beforeAt + mention + ' ' + afterCursor;
      const newCursorPosition = beforeAt.length + mention.length + 1;

      return {
        text: newText,
        cursorPosition: newCursorPosition
      };
    }

    // If no @ found, just insert the mention at cursor position
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    const mention = `@${user.fullname}`;

    const newText = beforeCursor + mention + ' ' + afterCursor;
    const newCursorPosition = cursorPosition + mention.length + 1;

    return {
      text: newText,
      cursorPosition: newCursorPosition
    };
  }

  /**
   * Calculate length of name excluding first word
   * @param fullname - The full name string
   * @returns Length of name without first word
   */
  static getPartNameLength(fullname: string): number {
    const parts = fullname.trim().split(/\s+/);
    if (parts.length <= 1) return 1;
    return parts.slice(1).join(' ').length + 1; // +1 for the space before the second part
  }

  /**
   * Remove first n characters from text
   * @param text - The input text
   * @param length - Number of characters to remove from start
   * @returns Text with first n characters removed
   */
  static removeFirstChars(text: string, length: number): string {
    return text.substring(length);
  }

  /**
   * Create notifications for mentioned users
   * @param mentions - Array of mention data
   * @param messageContent - The message content
   * @param senderId - ID of user who sent the message
   * @param senderName - Name of user who sent the message
   * @param roomId - ID of the chat room
   * @param messageId - ID of the message (optional)
   * @param senderAvatarUrl - Avatar URL of sender (optional)
   * @returns Promise that resolves when all notifications are created
   */
  static async createMentionNotifications(
    mentions: MentionData[],
    messageContent: string,
    senderId: string,
    senderName: string,
    roomId: string,
    messageId?: string,
    senderAvatarUrl?: string
  ): Promise<void> {
    if (!mentions || mentions.length === 0) {
      return;
    }

    // Create a preview of the message (first 50 characters)
    const messagePreview = messageContent.length > 50 ? `${messageContent.substring(0, 50)}...` : messageContent;

    // Create notifications for each mentioned user
    const notificationPromises = mentions.map((mention) =>
      notificationService.createNotification({
        userId: mention.userId,
        type: NotificationType.MENTION,
        title: `${senderName} mentioned you`,
        message: messagePreview,
        roomId,
        messageId,
        senderId,
        senderName,
        senderAvatarUrl,
        metadata: {
          mentionedUsername: mention.displayName
        }
      })
    );

    try {
      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error creating mention notifications:', error);
      // Don't throw - notification failure shouldn't block message sending
    }
  }
}
