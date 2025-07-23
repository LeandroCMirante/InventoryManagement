"use client";

import { useState } from "react";
import { useGetDashboardReportQuery } from "@/services/api";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Supondo que você usa ShadCN/UI ou similar
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  ArrowDown,
  ArrowUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar"; // Supondo que você usa ShadCN/UI ou similar

// Componente para os cards de estatísticas
const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  isLoading,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
  isLoading: boolean;
}) => (
  <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <Icon className={`h-6 w-6 ${colorClass}`} />
    </div>
    <div className="mt-2">
      {isLoading ? (
        <Loader2 className="h-7 w-7 animate-spin" />
      ) : (
        <p className="text-3xl font-bold">{value}</p>
      )}
    </div>
  </div>
);

export default function DashboardPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const {
    data: report,
    isLoading,
    isError,
  } = useGetDashboardReportQuery(
    {
      startDate: date?.from?.toISOString() || "",
      endDate: date?.to?.toISOString() || "",
    },
    {
      skip: !date?.from || !date?.to, // Não faz a busca se as datas não estiverem definidas
    }
  );

  const totalSales = Number(report?.totalSales || 0);
  const totalPurchases = Number(report?.totalPurchases || 0);
  const profit = totalSales - totalPurchases;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="mx-auto w-full">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>

        {/* Seletor de Período */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                    {format(date.to, "LLL dd, y", { locale: ptBR })}
                  </>
                ) : (
                  format(date.from, "LLL dd, y", { locale: ptBR })
                )
              ) : (
                <span>Escolha um período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      {isError && (
        <p className="text-red-500">Falha ao carregar os dados do relatório.</p>
      )}

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Vendas (Entradas)"
          value={formatCurrency(totalSales)}
          icon={ArrowUp}
          colorClass="text-green-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Total de Compras (Saídas)"
          value={formatCurrency(totalPurchases)}
          icon={ArrowDown}
          colorClass="text-red-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Lucro (Vendas - Compras)"
          value={formatCurrency(profit)}
          icon={DollarSign}
          colorClass={profit >= 0 ? "text-blue-500" : "text-orange-500"}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
