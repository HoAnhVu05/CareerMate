package vn.careermate.userservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import vn.careermate.userservice.dto.MessageWebSocketDTO;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Slf4j
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final Map<UUID, Set<WebSocketSession>> conversationSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        UUID conversationId = getConversationId(session);
        if (conversationId != null) {
            conversationSessions.computeIfAbsent(conversationId, k -> new CopyOnWriteArraySet<>()).add(session);
            log.info("WebSocket connection established for conversationId: {}. Session ID: {}", 
                     conversationId, session.getId());
        } else {
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        UUID conversationId = getConversationId(session);
        if (conversationId != null && conversationSessions.containsKey(conversationId)) {
            conversationSessions.get(conversationId).remove(session);
            log.info("WebSocket connection closed for conversationId: {}. Session ID: {}", 
                     conversationId, session.getId());
        }
    }

    public void broadcastMessage(UUID conversationId, MessageWebSocketDTO messageDto) {
        Set<WebSocketSession> sessions = conversationSessions.get(conversationId);
        if (sessions != null && !sessions.isEmpty()) {
            try {
                String payload = objectMapper.writeValueAsString(messageDto);
                TextMessage textMessage = new TextMessage(payload);
                for (WebSocketSession session : sessions) {
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                    }
                }
                log.info("Successfully broadcasted message via WebSocket to {} sessions for conversation: {}", 
                         sessions.size(), conversationId);
            } catch (IOException e) {
                log.error("Failed to broadcast message via WebSocket for conversation {}: {}", conversationId, e.getMessage());
            }
        }
    }

    private UUID getConversationId(WebSocketSession session) {
        try {
            URI uri = session.getUri();
            if (uri == null) return null;
            String query = uri.getQuery();
            if (query != null && query.contains("conversationId=")) {
                String val = query.split("conversationId=")[1].split("&")[0];
                return UUID.fromString(val);
            }
        } catch (Exception e) {
            log.error("Error parsing conversationId from WebSocket URI: {}", e.getMessage());
        }
        return null;
    }
}
