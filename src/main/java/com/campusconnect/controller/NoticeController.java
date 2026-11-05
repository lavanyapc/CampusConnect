package com.campusconnect.controller;

import com.campusconnect.model.Notice;
import com.campusconnect.repository.NoticeRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*")
public class NoticeController {

    private final NoticeRepository noticeRepository;

    public NoticeController(NoticeRepository noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    @GetMapping
    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }

    @PostMapping
    public Notice createNotice(@Valid @RequestBody Notice notice) {
        return noticeRepository.save(notice);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        if (!noticeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        noticeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
