import { zodResolver } from "@hookform/resolvers/zod"
import { NotebookPen } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const statusSchema = z.object({
  notes: z.string().min(5, "Status notes must be at least 5 characters.").max(500, "Notes too long."),
})

type StatusFormValues = z.infer<typeof statusSchema>

interface DailyStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DailyStatusDialog({ open, onOpenChange }: DailyStatusDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: { notes: "" },
  })

  const onSubmit = handleSubmit((values) => {
    // In a full integration, status notes log into local/mock storage
    toast.success(`Daily work status note saved (${values.notes.length} chars)!`)
    reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <NotebookPen className="size-5" />
            <DialogTitle>Daily Status Log</DialogTitle>
          </div>
          <DialogDescription>
            Record your key accomplishments or work summary for today.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="status-notes">Work Summary / Notes</Label>
            <Textarea
              id="status-notes"
              placeholder="e.g. Completed feature integration, reviewed pull requests, attended standup..."
              rows={4}
              {...register("notes")}
            />
            {errors.notes ? (
              <p className="text-destructive text-xs">{errors.notes.message}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save Status Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
