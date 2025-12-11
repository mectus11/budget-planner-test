import { useState } from "react";
import { Users, Plus, User, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSwitcherProps {
  profiles: string[];
  activeProfile: string;
  onSwitchProfile: (profile: string) => void;
  onCreateProfile: (name: string) => void;
  onRenameProfile: (oldName: string, newName: string) => void;
  onDeleteProfile: (profile: string) => void;
  t: any;
}

export function ProfileSwitcher({
  profiles,
  activeProfile,
  onSwitchProfile,
  onCreateProfile,
  onRenameProfile,
  onDeleteProfile,
  t,
}: ProfileSwitcherProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [renameProfileName, setRenameProfileName] = useState("");
  const [profileToRename, setProfileToRename] = useState("");
  const [profileToDelete, setProfileToDelete] = useState("");

  const handleCreate = () => {
    if (newProfileName.trim()) {
      onCreateProfile(newProfileName.trim());
      setNewProfileName("");
      setIsCreateDialogOpen(false);
    }
  };

  const openRenameDialog = (e: React.MouseEvent, profile: string) => {
    e.stopPropagation();
    setProfileToRename(profile);
    setRenameProfileName(profile);
    setIsRenameDialogOpen(true);
  };

  const handleRename = () => {
    if (renameProfileName.trim() && renameProfileName !== profileToRename) {
      onRenameProfile(profileToRename, renameProfileName.trim());
      setIsRenameDialogOpen(false);
    }
  };

  const openDeleteDialog = (e: React.MouseEvent, profile: string) => {
    e.stopPropagation();
    setProfileToDelete(profile);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (profileToDelete && profileToDelete !== activeProfile) {
      onDeleteProfile(profileToDelete);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline-block">{activeProfile}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{t.switchProfile}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile}
              onClick={() => onSwitchProfile(profile)}
              className="justify-between group"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {profile}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => openRenameDialog(e, profile)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive ${activeProfile === profile ? 'cursor-not-allowed' : ''}`}
                  onClick={(e) => openDeleteDialog(e, profile)}
                  disabled={activeProfile === profile}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                {activeProfile === profile && <Check className="h-4 w-4 ml-1" />}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.createProfile}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.createProfileTitle}</DialogTitle>
            <DialogDescription>
              {t.createProfileDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t.name}
              </Label>
              <Input
                id="name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Personal, Business"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleCreate} disabled={!newProfileName.trim()}>{t.createProfile}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.renameProfileTitle}</DialogTitle>
            <DialogDescription>
              {t.renameProfileDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rename-name" className="text-right">
                {t.name}
              </Label>
              <Input
                id="rename-name"
                value={renameProfileName}
                onChange={(e) => setRenameProfileName(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleRename} disabled={!renameProfileName.trim() || renameProfileName === profileToRename}>
              {t.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteProfileTitle}</DialogTitle>
            <DialogDescription>
              {t.deleteProfileDesc}
            </DialogDescription>
          </DialogHeader>
          {profileToDelete === activeProfile && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm text-destructive">
              {t.deleteProfileWarning}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={profileToDelete === activeProfile}
            >
              {t.deleteProfile}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
