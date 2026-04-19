"use server";

import prisma from "../../prisma/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTasks(token: string) {
  return await prisma.task.findMany({
    where: { userToken: token },
    orderBy: { deadline: "asc" },
  });
}

export async function addTask(token: string, formData: FormData) {
  const title = formData.get("title") as string;
  const detail = formData.get("detail") as string;
  const deadline = formData.get("deadline") as string;

  if (!title || !deadline) return;

  await prisma.task.create({
    data: {
      title,
      detail: detail || null,
      deadline: new Date(deadline),
      userToken: token,
    },
  });
  revalidatePath("/");
}

export async function toggleTask(id: string, isCompleted: boolean) {
  await prisma.task.update({
    where: { id },
    data: { isCompleted: !isCompleted },
  });
  revalidatePath("/");
}

export async function updateTask(id: string, title: string, detail: string | null, deadline: string) {
  await prisma.task.update({
    where: { id },
    data: {
      title,
      detail: detail || null,
      deadline: new Date(deadline),
    },
  });
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({
    where: { id },
  });
  revalidatePath("/");
}

export async function changeToken(oldToken: string, newToken: string) {
  if (oldToken === newToken) return { success: true };

  // Cek apakah token baru sudah digunakan oleh orang lain (ada tugasnya)
  const existingTasks = await prisma.task.findFirst({
    where: { userToken: newToken },
  });

  if (existingTasks) {
    return {
      success: false,
      message: "Token sudah digunakan oleh orang lain.",
    };
  }

  // Pindahkan semua tugas ke token baru
  await prisma.task.updateMany({
    where: { userToken: oldToken },
    data: { userToken: newToken },
  });

  // Pindahkan settings ke token baru
  const settings = await prisma.userSettings.findUnique({
    where: { userToken: oldToken },
  });

  if (settings) {
    await prisma.userSettings.upsert({
      where: { userToken: newToken },
      create: { userToken: newToken, title: settings.title },
      update: { title: settings.title },
    });
    await prisma.userSettings.delete({
      where: { userToken: oldToken },
    });
  }

  return { success: true };
}

export async function getUserSettings(token: string) {
  let settings = await prisma.userSettings.findUnique({
    where: { userToken: token },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userToken: token, title: "Tugas Saya" },
    });
  }

  return settings;
}

export async function updateTitle(token: string, title: string) {
  await prisma.userSettings.update({
    where: { userToken: token },
    data: { title },
  });
  revalidatePath("/");
}
