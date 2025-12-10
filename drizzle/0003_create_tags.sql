CREATE TABLE `tag` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `name` TEXT NOT NULL,
  `user_id` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `task_tag` (
  `task_id` TEXT NOT NULL,
  `tag_id` TEXT NOT NULL,
  FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
