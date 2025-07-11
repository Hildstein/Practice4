import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ChatScreen extends StatefulWidget {
  final int vacancyId;
  final int candidateId;
  final int currentUserId;
  const ChatScreen({
    super.key,
    required this.vacancyId,
    required this.candidateId,
    required this.currentUserId,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  List<dynamic> messages = [];
  bool loading = true;
  final _controller = TextEditingController();
  bool sending = false;

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  Future<void> _loadMessages() async {
    final msgs = await ApiService().fetchMessages(
      widget.vacancyId,
      widget.candidateId,
    );
    setState(() {
      messages = msgs ?? [];
      loading = false;
    });
  }

  Future<void> _sendMessage() async {
    if (_controller.text.trim().isEmpty) return;
    setState(() => sending = true);
    await ApiService().sendMessage(
      widget.vacancyId,
      widget.candidateId,
      _controller.text.trim(),
    );
    _controller.clear();
    await _loadMessages();
    setState(() => sending = false);
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            itemCount: messages.length,
            itemBuilder: (context, index) {
              final msg = messages[index];
              final isMine = msg['senderId'] == widget.currentUserId;
              return Align(
                alignment: isMine
                    ? Alignment.centerRight
                    : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.symmetric(
                    vertical: 2,
                    horizontal: 8,
                  ),
                  padding: const EdgeInsets.symmetric(
                    vertical: 8,
                    horizontal: 12,
                  ),
                  decoration: BoxDecoration(
                    color: isMine ? Colors.blue[200] : Colors.grey[300],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: isMine
                        ? CrossAxisAlignment.end
                        : CrossAxisAlignment.start,
                    children: [
                      Text(
                        msg['senderName'] ?? '',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.black54,
                        ),
                      ),
                      Text(
                        msg['content'] ?? '',
                        style: const TextStyle(fontSize: 16),
                      ),
                      Text(
                        msg['sentAt'] != null
                            ? DateTime.parse(msg['sentAt']).toLocal().toString()
                            : '',
                        style: const TextStyle(
                          fontSize: 10,
                          color: Colors.black45,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                decoration: const InputDecoration(
                  hintText: "Введите сообщение...",
                ),
              ),
            ),
            sending
                ? const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                : IconButton(
                    icon: const Icon(Icons.send),
                    onPressed: _sendMessage,
                  ),
          ],
        ),
      ],
    );
  }
}
