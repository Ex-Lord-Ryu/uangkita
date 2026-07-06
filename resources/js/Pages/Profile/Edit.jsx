import Card, { CardBody } from '@/Components/ui/Card';
import Icon from '@/Components/Icon';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <SidebarLayout
            title="Profil"
            header={
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kelola informasi akun, password, dan keamanan profilmu.
                </p>
            }
        >
            <Head title="Profil" />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                <div className="space-y-6">
                    <Card>
                        <CardBody>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-2xl"
                            />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <UpdatePasswordForm className="max-w-2xl" />
                        </CardBody>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <div className="border-b border-gray-100 bg-gradient-to-br from-brand-600 to-gray-900 p-5 text-white dark:border-gray-700/60">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                                <Icon name="settings" className="h-6 w-6" />
                            </span>
                            <h2 className="mt-4 text-lg font-semibold">
                                Pengaturan akun
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-brand-100/80">
                                Pastikan nama, email, dan password selalu sesuai
                                dengan akun yang kamu gunakan.
                            </p>
                        </div>
                        <CardBody>
                            <DeleteUserForm />
                        </CardBody>
                    </Card>
                </div>
            </div>
        </SidebarLayout>
    );
}
