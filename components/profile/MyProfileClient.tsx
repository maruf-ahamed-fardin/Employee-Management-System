'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Contact,
  KeyRound,
  Save,
  Plus,
  Trash2,
  Building2,
  Briefcase,
  Calendar,
  Droplet,
  MapPin,
  Phone,
  Mail,
  Shield,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProfileCardTile } from '@/components/employee/ProfileCardTile';
import { toast } from 'sonner';

interface ProfileData {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string | null;
  bloodGroup: string | null;
  department: string;
  position: string;
  manager: string | null;
  employmentType: string;
  joiningDate: string;
  workLocation: string;
  photoUrl: string | null;
  address: any;
  emergencyContact: any;
  card: {
    headline: string;
    businessPhone: string;
    showPersonalPhone: boolean;
    links: { kind: string; url: string }[];
  };
}

export function MyProfileClient({ initialData }: { initialData: ProfileData }) {
  const [activeTab, setActiveTab] = useState<'details' | 'card'>('details');
  const [data, setData] = useState<ProfileData>(initialData);
  const [saving, setSaving] = useState(false);

  // Form states
  const [phone, setPhone] = useState(data.phone || '');
  const [bloodGroup, setBloodGroup] = useState(data.bloodGroup || 'B+');
  const [photoUrl, setPhotoUrl] = useState(data.photoUrl || '');
  const [addressLine, setAddressLine] = useState(data.address?.line1 || '');
  const [addressCity, setAddressCity] = useState(data.address?.city || 'Dhaka');
  const [emergencyName, setEmergencyName] = useState(data.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(data.emergencyContact?.phone || '');

  // Card states
  const [headline, setHeadline] = useState(data.card?.headline || '');
  const [businessPhone, setBusinessPhone] = useState(data.card?.businessPhone || '');
  const [showPersonalPhone, setShowPersonalPhone] = useState(
    data.card?.showPersonalPhone ?? true
  );
  const [links, setLinks] = useState<{ kind: string; url: string }[]>(
    data.card?.links || []
  );

  const handleAddLink = () => {
    setLinks([...links, { kind: 'LINKEDIN', url: 'https://' }]);
  };

  const handleRemoveLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleUpdateLink = (idx: number, field: 'kind' | 'url', val: string) => {
    const updated = [...links];
    updated[idx] = { ...updated[idx], [field]: val };
    setLinks(updated);
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          bloodGroup,
          photoUrl: photoUrl.trim() || null,
          address: { line1: addressLine, city: addressCity, country: 'Bangladesh' },
          emergencyContact: { name: emergencyName, phone: emergencyPhone },
        }),
      });

      if (!res.ok) throw new Error('Failed to update details');
      toast.success('Personal details updated successfully');
      setData((prev) => ({
        ...prev,
        phone,
        bloodGroup,
        photoUrl: photoUrl.trim() || null,
        address: { line1: addressLine, city: addressCity },
        emergencyContact: { name: emergencyName, phone: emergencyPhone },
      }));
    } catch (err: any) {
      toast.error(err.message || 'Error updating details');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          businessPhone,
          showPersonalPhone,
          links,
          photoUrl: photoUrl.trim() || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update card');
      toast.success('Digital Team Card updated successfully');
      setData((prev) => ({
        ...prev,
        card: {
          headline,
          businessPhone,
          showPersonalPhone,
          links,
        },
      }));
    } catch (err: any) {
      toast.error(err.message || 'Error updating card');
    } finally {
      setSaving(false);
    }
  };

  const previewPerson = {
    employeeId: data.id,
    employeeCode: data.employeeCode,
    fullName: data.fullName,
    email: data.email,
    phone: showPersonalPhone ? phone : null,
    businessPhone: businessPhone || null,
    position: data.position,
    department: data.department,
    departmentId: 'dept-id',
    workLocation: data.workLocation,
    photoUrl: photoUrl.trim() || null,
    headline: headline || null,
    bloodGroup,
    joiningDate: data.joiningDate,
    managerName: data.manager,
    links,
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation to Security */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            My Employee Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal contact details, emergency contacts, and digital NFC card.
          </p>
        </div>

        <Button asChild variant="outline" className="gap-2 font-semibold">
          <Link href="/profile/security">
            <KeyRound className="size-4 text-primary" />
            <span>Password & Security</span>
          </Link>
        </Button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('details')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'details'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
          }`}
        >
          <User className="size-4" />
          <span>My Personal Details</span>
        </button>

        <button
          onClick={() => setActiveTab('card')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'card'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
          }`}
        >
          <Contact className="size-4" />
          <span>Team Profile Card (NFC)</span>
        </button>
      </div>

      {/* Tab 1: Personal Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Read-only Job Meta Card */}
          <aside className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5 h-fit">
            <div>
              <div className="size-16 rounded-2xl bg-[#252175] text-[#F37021] font-bold text-xl flex items-center justify-center mb-3 ring-4 ring-card shadow-sm">
                {data.fullName.slice(0, 2).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-foreground">{data.fullName}</h2>
              <p className="text-xs font-medium text-muted-foreground">{data.position}</p>
            </div>

            <dl className="space-y-3 border-t border-border/60 pt-4 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Employee ID</dt>
                <dd className="font-mono font-bold text-foreground">{data.employeeCode}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Department</dt>
                <dd className="font-medium text-foreground">{data.department}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Manager</dt>
                <dd className="font-medium text-foreground">{data.manager || 'None'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Employment</dt>
                <dd className="font-medium text-foreground capitalize">
                  {data.employmentType.toLowerCase().replace('_', ' ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Work Email</dt>
                <dd className="font-medium text-foreground truncate max-w-[150px]">
                  {data.email}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Joined Date</dt>
                <dd className="font-medium text-foreground">{data.joiningDate}</dd>
              </div>
            </dl>
          </aside>

          {/* Editable Personal Form */}
          <form
            onSubmit={handleSaveDetails}
            className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-foreground">Contact & Identity</h2>
              <p className="text-xs text-muted-foreground">
                Your direct mobile phone, blood group for emergency, and address.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Mobile Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801700000000"
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Avatar Image URL</label>
                <Input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Home Address Line</label>
                <Input
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. House 42, Road 11, Banani"
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">City</label>
                <Input
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  placeholder="Dhaka"
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="border-t border-border/60 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Contact Person Name</label>
                  <Input
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="e.g. Spouse / Parent Name"
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Contact Phone</label>
                  <Input
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+8801800000000"
                    className="h-10 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                <span>Save Personal Details</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Digital Team Card Editor */}
      {activeTab === 'card' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Card Form */}
          <form
            onSubmit={handleSaveCard}
            className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-foreground">Digital Card Customization</h2>
              <p className="text-xs text-muted-foreground">
                Colleagues and clients see this when they scan your QR code or NFC card.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Headline / Bio Line</label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Architecting resilient full-stack systems and high-throughput platforms"
                  className="h-10 text-xs"
                  maxLength={140}
                />
                <span className="text-[10px] text-muted-foreground">Maximum 140 characters</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Business Line (Work Phone)</label>
                <Input
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="+88029870001"
                  className="h-10 text-xs"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/80 bg-secondary/30">
                <input
                  type="checkbox"
                  id="showPersonalPhone"
                  checked={showPersonalPhone}
                  onChange={(e) => setShowPersonalPhone(e.target.checked)}
                  className="size-4 text-primary rounded cursor-pointer"
                />
                <label htmlFor="showPersonalPhone" className="text-xs text-foreground cursor-pointer">
                  <span className="font-semibold block">Show personal phone number on card</span>
                  <span className="text-[11px] text-muted-foreground">
                    If unchecked, only your work email and business line will be public on your card.
                  </span>
                </label>
              </div>
            </div>

            {/* Social Links Manager */}
            <div className="border-t border-border/60 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Public Social & Web Links
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    LinkedIn, GitHub, Portfolio, X/Twitter, or personal website.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLink}
                  className="text-xs font-semibold gap-1.5 h-8"
                >
                  <Plus className="size-3.5" />
                  <span>Add Link</span>
                </Button>
              </div>

              {links.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-3 text-center border border-dashed border-border rounded-xl">
                  No links added yet. Click &quot;Add Link&quot; above to connect your LinkedIn or GitHub.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {links.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={link.kind}
                        onChange={(e) => handleUpdateLink(idx, 'kind', e.target.value)}
                        className="h-9 px-2.5 rounded-lg border border-input bg-background text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="LINKEDIN">LinkedIn</option>
                        <option value="GITHUB">GitHub</option>
                        <option value="TWITTER">X / Twitter</option>
                        <option value="PORTFOLIO">Portfolio</option>
                        <option value="WEBSITE">Website</option>
                      </select>

                      <Input
                        value={link.url}
                        onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                        placeholder="https://..."
                        className="h-9 text-xs flex-1"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLink(idx)}
                        className="size-9 text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                <span>Save Digital Card</span>
              </Button>
            </div>
          </form>

          {/* Live Card Preview */}
          <div className="sticky top-20 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
              Live Card Preview
            </p>
            <ProfileCardTile person={previewPerson} />
          </div>
        </div>
      )}
    </div>
  );
}
