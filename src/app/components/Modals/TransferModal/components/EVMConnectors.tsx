import { Connector, CreateConnectorFn } from "@wagmi/core";
import { Wallet } from "lucide-react";
import Image from "next/image";

import { Button } from "../../../ui/button";

export const EVMConnectors: React.FC<{
  connectors: readonly Connector<CreateConnectorFn>[];
  connect: (args: { connector: Connector<CreateConnectorFn> }) => void;
}> = ({ connectors, connect }) => {
  return (
    <>
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          type="button"
          variant="outline"
          onClick={() => connect({ connector })}
        >
          {connector.icon && (
            <Image
              src={connector.icon}
              alt={`${connector.name} icon`}
              className="rounded"
              width={18}
              height={18}
              priority
            />
          )}
          {!connector.icon && (
            <div className="flex items-center gap-2">
              <Wallet className="w-[18px] h-[18px] text-orange-400" />
              <span>{connector.name}</span>
            </div>
          )}
        </Button>
      ))}
    </>
  );
};
